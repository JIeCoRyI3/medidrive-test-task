import { configureStore } from '@reduxjs/toolkit'
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  persistStore,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import serviceLogReducer from './serviceLogSlice'

const persistedServiceLogsReducer = persistReducer(
  {
    key: 'serviceLogs',
    storage,
  },
  serviceLogReducer,
)

export const store = configureStore({
  reducer: {
    serviceLogs: persistedServiceLogsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
