import Modal from './Modal';

export default function ConfirmDialog({ open, title = 'Xác nhận', message, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose} width={420}>
      <p>{message}</p>
      <div className="actions end">
        <button className="ghost-btn" onClick={onClose}>Hủy</button>
        <button className="danger-btn" onClick={onConfirm}>Xác nhận</button>
      </div>
    </Modal>
  );
}
