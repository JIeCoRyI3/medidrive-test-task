import type { ServiceLogFormValues } from '../types/serviceLog'

export const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDays = (dateString: string, days: number): string => {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)
  return formatDateInput(date)
}

export const createDefaultFormValues = (): ServiceLogFormValues => {
  const startDate = formatDateInput(new Date())
  return {
    providerId: '',
    serviceOrder: '',
    carId: '',
    odometer: 0,
    engineHours: 0,
    startDate,
    endDate: addDays(startDate, 1),
    type: 'planned',
    serviceDescription: '',
  }
}
