import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import SaveIcon from '@mui/icons-material/Save'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  clearDrafts,
  createDraft,
  createServiceLog,
  deleteDraft,
  setDraftSaving,
  setActiveDraft,
  updateActiveDraftData,
} from '../store/serviceLogSlice'
import type { ServiceLogFormValues } from '../types/serviceLog'
import { addDays, createDefaultFormValues } from '../utils/date'
import { serviceLogSchema } from '../validation/serviceLogSchema'
import { ServiceLogFields } from './ServiceLogFields'

export const ServiceLogForm = () => {
  const dispatch = useAppDispatch()
  const { drafts, activeDraftId, isDraftSaving } = useAppSelector((state) => state.serviceLogs)
  const activeDraft = useMemo(
    () => drafts.find((draft) => draft.id === activeDraftId) ?? null,
    [drafts, activeDraftId],
  )

  const { control, register, handleSubmit, formState, getValues, setValue, reset } = useForm<ServiceLogFormValues>(
    {
      resolver: yupResolver(serviceLogSchema),
      mode: 'onTouched',
      defaultValues: createDefaultFormValues(),
    },
  )

  const values = useWatch({ control })
  const startDate = useWatch({ control, name: 'startDate' })
  const hydratedDraftIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (drafts.length === 0) {
      const defaults = createDefaultFormValues()
      dispatch(createDraft({ data: defaults }))
      reset(defaults)
    }
  }, [dispatch, drafts.length, reset])

  useEffect(() => {
    if (!activeDraftId) return
    if (hydratedDraftIdRef.current === activeDraftId) return
    const selectedDraft = drafts.find((draft) => draft.id === activeDraftId)
    if (!selectedDraft) return
    reset(selectedDraft.data)
    hydratedDraftIdRef.current = activeDraftId
  }, [activeDraftId, drafts, reset])

  useEffect(() => {
    if (!startDate) return
    const nextEndDate = addDays(startDate, 1)
    if (getValues('endDate') !== nextEndDate) {
      setValue('endDate', nextEndDate, { shouldDirty: true, shouldTouch: true })
    }
  }, [startDate, getValues, setValue])

  const hasChanges = useMemo(() => {
    if (!activeDraft) return false
    return JSON.stringify(values) !== JSON.stringify(activeDraft.data)
  }, [activeDraft, values])

  useEffect(() => {
    if (!activeDraftId || !activeDraft) return

    if (!hasChanges) {
      if (isDraftSaving) {
        dispatch(setDraftSaving(false))
      }
      return
    }

    if (!isDraftSaving) {
      dispatch(setDraftSaving(true))
    }

    const timeout = window.setTimeout(() => {
      dispatch(updateActiveDraftData(getValues()))
      dispatch(setDraftSaving(false))
    }, 450)

    return () => window.clearTimeout(timeout)
  }, [activeDraftId, activeDraft, dispatch, getValues, hasChanges, isDraftSaving])

  const onSubmit = (formValues: ServiceLogFormValues) => {
    dispatch(createServiceLog(formValues))
  }

  const handleCreateDraft = () => {
    dispatch(createDraft({ data: getValues() }))
  }

  const handleDeleteDraft = () => {
    if (!activeDraftId) return
    dispatch(deleteDraft(activeDraftId))
  }

  const handleClearDrafts = () => {
    dispatch(clearDrafts())
    reset(createDefaultFormValues())
  }

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="h6">Service Log Draft</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {isDraftSaving ? <CircularProgress size={16} /> : <CheckCircleIcon color="success" fontSize="small" />}
            <Typography variant="body2">{isDraftSaving ? 'Saving...' : 'Draft saved'}</Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {drafts.map((draft) => (
            <Chip
              key={draft.id}
              color={draft.id === activeDraftId ? 'primary' : 'default'}
              variant={draft.id === activeDraftId ? 'filled' : 'outlined'}
              label={draft.name}
              onClick={() => dispatch(setActiveDraft(draft.id))}
              icon={draft.saved ? <TaskAltIcon /> : undefined}
            />
          ))}
        </Stack>

        <Divider />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <ServiceLogFields control={control} register={register} errors={formState.errors} />
            {Object.keys(formState.errors).length > 0 && (
              <Alert severity="error">Please resolve validation errors before creating a service log.</Alert>
            )}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button variant="outlined" startIcon={<NoteAddIcon />} onClick={handleCreateDraft}>
                Create Draft
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteDraft}
                disabled={!activeDraftId}
              >
                Delete Draft
              </Button>
              <Button variant="outlined" color="error" onClick={handleClearDrafts}>
                Clear All Drafts
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                Create Service Log
              </Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Paper>
  )
}
