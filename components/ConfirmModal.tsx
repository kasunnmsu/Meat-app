"use client";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmColor,
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
            Não, voltar
          </button>

          <button type="button" onClick={onConfirm} className="danger-button" style={confirmColor ? { background: confirmColor } : undefined}>
            Sim, confirmar
          </button>
        </div>
      </section>
    </div>
  );
}
