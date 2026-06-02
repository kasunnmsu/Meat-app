"use client";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <section className="modal-card">
        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          <button type="button" onClick={onCancel} className="secondary-button">
            No, go back
          </button>

          <button type="button" onClick={onConfirm} className="primary-button">
            Yes, confirm
          </button>
        </div>
      </section>
    </div>
  );
}
