import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { yupResolver } from '@hookform/resolvers/yup'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { deleteServiceLog, updateServiceLog } from '../store/serviceLogSlice'
import type { ServiceLog, ServiceLogFormValues, ServiceType } from '../types/serviceLog'
import { addDays } from '../utils/date'
import { serviceLogSchema } from '../validation/serviceLogSchema'
import { ServiceLogFields } from './ServiceLogFields'

type TypeFilter = 'all' | ServiceType

const searchInLog = (log: ServiceLog, query: string): boolean => {
  const normalized = query.toLowerCase().trim()
  if (!normalized) return true

  return [
    log.providerId,
    log.serviceOrder,
    log.carId,
    log.type,
    log.serviceDescription,
    String(log.odometer),
    String(log.engineHours),
  ].some((value) => value.toLowerCase().includes(normalized))
}

interface EditServiceLogDialogProps {
  open: boolean
  serviceLog: ServiceLog | null
  onClose: VoidFunction
}

const EditServiceLogDialog = ({ open, serviceLog, onClose }: EditServiceLogDialogProps) => {
  const dispatch = useAppDispatch()
  const { control, register, handleSubmit, reset, setValue, getValues, formState } = useForm<ServiceLogFormValues>({
    resolver: yupResolver(serviceLogSchema),
    mode: 'onTouched',
    defaultValues: serviceLog
      ? {
          providerId: serviceLog.providerId,
          serviceOrder: serviceLog.serviceOrder,
          carId: serviceLog.carId,
          odometer: serviceLog.odometer,
          engineHours: serviceLog.engineHours,
          startDate: serviceLog.startDate,
          endDate: serviceLog.endDate,
          type: serviceLog.type,
          serviceDescription: serviceLog.serviceDescription,
        }
      : undefined,
  })

  const startDate = useWatch({ control, name: 'startDate' })

  useEffect(() => {
    if (serviceLog) {
      reset({
        providerId: serviceLog.providerId,
        serviceOrder: serviceLog.serviceOrder,
        carId: serviceLog.carId,
        odometer: serviceLog.odometer,
        engineHours: serviceLog.engineHours,
        startDate: serviceLog.startDate,
        endDate: serviceLog.endDate,
        type: serviceLog.type,
        serviceDescription: serviceLog.serviceDescription,
      })
    }
  }, [reset, serviceLog])

  useEffect(() => {
    if (!startDate) return
    const endDate = addDays(startDate, 1)
    if (getValues('endDate') !== endDate) {
      setValue('endDate', endDate, { shouldDirty: true, shouldTouch: true })
    }
  }, [startDate, getValues, setValue])

  const onSubmit = (values: ServiceLogFormValues) => {
    if (!serviceLog) return
    dispatch(
      updateServiceLog({
        ...serviceLog,
        ...values,
      }),
    )
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Service Log</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <ServiceLogFields control={control} register={register} errors={formState.errors} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const ServiceLogTable = () => {
  const dispatch = useAppDispatch()
  const serviceLogs = useAppSelector((state) => state.serviceLogs.serviceLogs)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [editingLog, setEditingLog] = useState<ServiceLog | null>(null)

  const filteredLogs = useMemo(
    () =>
      serviceLogs.filter((log) => {
        const typeMatches = type === 'all' || log.type === type
        const searchMatches = searchInLog(log, search)
        const fromMatches = !fromDate || new Date(`${log.startDate}T00:00:00`) >= new Date(`${fromDate}T00:00:00`)
        const toMatches = !toDate || new Date(`${log.startDate}T00:00:00`) <= new Date(`${toDate}T00:00:00`)

        return typeMatches && searchMatches && fromMatches && toMatches
      }),
    [serviceLogs, search, fromDate, toDate, type],
  )

  const clearFilters = () => {
    setSearch('')
    setType('all')
    setFromDate('')
    setToDate('')
  }

  const exportFilteredLogsToPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('Filtered Service Logs', 14, 15)

    autoTable(doc, {
      startY: 22,
      head: [['Provider', 'Order', 'Car', 'Start Date', 'End Date', 'Type', 'Odometer', 'Engine Hours', 'Description']],
      body: filteredLogs.map((log) => [
        log.providerId,
        log.serviceOrder,
        log.carId,
        log.startDate,
        log.endDate,
        log.type,
        String(log.odometer),
        String(log.engineHours),
        log.serviceDescription,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [10, 106, 136] },
    })

    const fileDate = new Date().toISOString().slice(0, 10)
    doc.save(`service-logs-${fileDate}.pdf`)
  }

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Service Logs</Typography>

        <Stack spacing={1.5}>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            }}
          >
            <TextField
              label="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField select label="Type" value={type} onChange={(event) => setType(event.target.value as TypeFilter)} fullWidth>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="planned">Planned</MenuItem>
              <MenuItem value="unplanned">Unplanned</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
            </TextField>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            }}
          >
            <TextField
              type="date"
              label="Start From"
              value={fromDate}
              InputLabelProps={{ shrink: true }}
              onChange={(event) => setFromDate(event.target.value)}
              fullWidth
            />
            <TextField
              type="date"
              label="Start To"
              value={toDate}
              InputLabelProps={{ shrink: true }}
              onChange={(event) => setToDate(event.target.value)}
              fullWidth
            />
            <Box />
            <Box />
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={clearFilters}>
              Clear All Filters
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={exportFilteredLogsToPdf}
              disabled={filteredLogs.length === 0}
            >
              Export Filtered Logs (PDF)
            </Button>
          </Stack>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Provider</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Car</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Odometer</TableCell>
                <TableCell align="right">Engine Hours</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.providerId}</TableCell>
                  <TableCell>{log.serviceOrder}</TableCell>
                  <TableCell>{log.carId}</TableCell>
                  <TableCell>{log.startDate}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{log.type}</TableCell>
                  <TableCell align="right">{log.odometer}</TableCell>
                  <TableCell align="right">{log.engineHours}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton aria-label="edit service log" onClick={() => setEditingLog(log)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="delete service log"
                        color="error"
                        onClick={() => dispatch(deleteServiceLog(log.id))}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">
                      No logs match your search/filter criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <EditServiceLogDialog open={Boolean(editingLog)} serviceLog={editingLog} onClose={() => setEditingLog(null)} />
    </Paper>
  )
}
