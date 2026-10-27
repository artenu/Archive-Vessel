import { Button } from './Button'
import { Modal } from './Modal'

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-xs text-slate-600">Tindakan ini hanya simulasi frontend dan tidak mengubah backend.</p>
    </Modal>
  )
}
