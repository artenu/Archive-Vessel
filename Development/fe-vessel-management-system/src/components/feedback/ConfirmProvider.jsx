import { useMemo, useState } from 'react'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'
import { ConfirmContext } from './confirmContext'

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const value = useMemo(
    () => ({
      confirm: ({ title, description, onConfirm }) => {
        setDialog({ title, description, onConfirm })
      },
    }),
    [],
  )

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmationDialog
        open={Boolean(dialog)}
        title={dialog?.title}
        description={dialog?.description}
        onClose={() => setDialog(null)}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          dialog?.onConfirm?.()
          setDialog(null)
        }}
      />
    </ConfirmContext.Provider>
  )
}
