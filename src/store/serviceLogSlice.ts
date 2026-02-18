import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ServiceLog, ServiceLogDraft, ServiceLogFormValues } from '../types/serviceLog'

interface ServiceLogState {
  drafts: ServiceLogDraft[]
  activeDraftId: string | null
  serviceLogs: ServiceLog[]
  isDraftSaving: boolean
}

const initialState: ServiceLogState = {
  drafts: [],
  activeDraftId: null,
  serviceLogs: [],
  isDraftSaving: false,
}

const nextDraftName = (drafts: ServiceLogDraft[]): string => `Draft ${drafts.length + 1}`

const getActiveDraft = (state: ServiceLogState): ServiceLogDraft | undefined =>
  state.drafts.find((draft) => draft.id === state.activeDraftId)

export const serviceLogSlice = createSlice({
  name: 'serviceLogs',
  initialState,
  reducers: {
    createDraft: (state, action: PayloadAction<{ data: ServiceLogFormValues; name?: string }>) => {
      const draft: ServiceLogDraft = {
        id: crypto.randomUUID(),
        name: action.payload.name ?? nextDraftName(state.drafts),
        saved: true,
        updatedAt: new Date().toISOString(),
        data: action.payload.data,
      }

      state.drafts.unshift(draft)
      state.activeDraftId = draft.id
    },
    updateActiveDraftData: (state, action: PayloadAction<ServiceLogFormValues>) => {
      const activeDraft = getActiveDraft(state)
      if (!activeDraft) return
      activeDraft.data = action.payload
      activeDraft.updatedAt = new Date().toISOString()
      activeDraft.saved = true
    },
    setActiveDraft: (state, action: PayloadAction<string>) => {
      const exists = state.drafts.some((draft) => draft.id === action.payload)
      if (exists) {
        state.activeDraftId = action.payload
      }
    },
    deleteDraft: (state, action: PayloadAction<string>) => {
      state.drafts = state.drafts.filter((draft) => draft.id !== action.payload)
      if (state.activeDraftId === action.payload) {
        state.activeDraftId = state.drafts[0]?.id ?? null
      }
    },
    clearDrafts: (state) => {
      state.drafts = []
      state.activeDraftId = null
    },
    setDraftSaving: (state, action: PayloadAction<boolean>) => {
      state.isDraftSaving = action.payload
    },
    createServiceLog: (state, action: PayloadAction<ServiceLogFormValues>) => {
      const now = new Date().toISOString()
      state.serviceLogs.unshift({
        id: crypto.randomUUID(),
        ...action.payload,
        createdAt: now,
        updatedAt: now,
      })
    },
    updateServiceLog: (state, action: PayloadAction<ServiceLog>) => {
      state.serviceLogs = state.serviceLogs.map((log) =>
        log.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : log,
      )
    },
    deleteServiceLog: (state, action: PayloadAction<string>) => {
      state.serviceLogs = state.serviceLogs.filter((log) => log.id !== action.payload)
    },
  },
})

export const {
  createDraft,
  updateActiveDraftData,
  setActiveDraft,
  deleteDraft,
  clearDrafts,
  setDraftSaving,
  createServiceLog,
  updateServiceLog,
  deleteServiceLog,
} = serviceLogSlice.actions

export default serviceLogSlice.reducer
