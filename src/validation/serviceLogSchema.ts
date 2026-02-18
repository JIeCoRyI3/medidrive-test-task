import * as yup from 'yup'
import type { ServiceLogFormValues } from '../types/serviceLog'

const numberField = (label: string) =>
  yup
    .number()
    .typeError(`${label} must be a number`)
    .required(`${label} is required`)
    .min(0, `${label} cannot be negative`)

export const serviceLogSchema: yup.ObjectSchema<ServiceLogFormValues> = yup.object({
  providerId: yup.string().trim().required('Provider ID is required'),
  serviceOrder: yup.string().trim().required('Service order is required'),
  carId: yup.string().trim().required('Car ID is required'),
  odometer: numberField('Odometer'),
  engineHours: numberField('Engine hours'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup
    .string()
    .required('End date is required')
    .test('after-start', 'End date must be after start date', function (endDate) {
      const { startDate } = this.parent as ServiceLogFormValues
      if (!startDate || !endDate) return false
      return new Date(`${endDate}T00:00:00`) > new Date(`${startDate}T00:00:00`)
    }),
  type: yup
    .mixed<ServiceLogFormValues['type']>()
    .oneOf(['planned', 'unplanned', 'emergency'])
    .required('Service type is required'),
  serviceDescription: yup.string().trim().required('Service description is required'),
})
