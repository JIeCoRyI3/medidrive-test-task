import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import type { ServiceLogFormValues } from '../types/serviceLog'

interface ServiceLogFieldsProps {
  control: Control<ServiceLogFormValues>
  register: UseFormRegister<ServiceLogFormValues>
  errors: FieldErrors<ServiceLogFormValues>
}

export const ServiceLogFields = ({ control, register, errors }: ServiceLogFieldsProps) => (
  <Box
    sx={{
      display: 'grid',
      gap: 2,
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
    }}
  >
    <Box>
      <TextField
        fullWidth
        label="Provider ID"
        InputLabelProps={{ shrink: true }}
        {...register('providerId')}
        error={Boolean(errors.providerId)}
        helperText={errors.providerId?.message}
      />
    </Box>
    <Box>
      <TextField
        fullWidth
        label="Service Order"
        InputLabelProps={{ shrink: true }}
        {...register('serviceOrder')}
        error={Boolean(errors.serviceOrder)}
        helperText={errors.serviceOrder?.message}
      />
    </Box>
    <Box>
      <TextField
        fullWidth
        label="Car ID"
        InputLabelProps={{ shrink: true }}
        {...register('carId')}
        error={Boolean(errors.carId)}
        helperText={errors.carId?.message}
      />
    </Box>
    <Box>
      <TextField
        fullWidth
        label="Odometer (mi)"
        type="number"
        InputLabelProps={{ shrink: true }}
        {...register('odometer', { valueAsNumber: true })}
        error={Boolean(errors.odometer)}
        helperText={errors.odometer?.message}
      />
    </Box>
    <Box>
      <TextField
        fullWidth
        label="Engine Hours"
        type="number"
        InputLabelProps={{ shrink: true }}
        {...register('engineHours', { valueAsNumber: true })}
        error={Boolean(errors.engineHours)}
        helperText={errors.engineHours?.message}
      />
    </Box>
    <Box>
      <TextField
        fullWidth
        label="Start Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        {...register('startDate')}
        error={Boolean(errors.startDate)}
        helperText={errors.startDate?.message}
      />
    </Box>
    <Box>
      <TextField
        fullWidth
        label="End Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        {...register('endDate')}
        error={Boolean(errors.endDate)}
        helperText={errors.endDate?.message}
      />
    </Box>
    <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <TextField
            select
            fullWidth
            label="Service Type"
            InputLabelProps={{ shrink: true }}
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.type)}
            helperText={errors.type?.message}
          >
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="unplanned">Unplanned</MenuItem>
            <MenuItem value="emergency">Emergency</MenuItem>
          </TextField>
        )}
      />
    </Box>
    <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Service Description"
        InputLabelProps={{ shrink: true }}
        {...register('serviceDescription')}
        error={Boolean(errors.serviceDescription)}
        helperText={errors.serviceDescription?.message}
      />
    </Box>
  </Box>
)
