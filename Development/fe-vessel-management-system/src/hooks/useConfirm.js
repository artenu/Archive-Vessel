import { useContext } from 'react'
import { ConfirmContext } from '../components/feedback/confirmContext'

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm harus digunakan di dalam ConfirmProvider')
  }
  return context
}
