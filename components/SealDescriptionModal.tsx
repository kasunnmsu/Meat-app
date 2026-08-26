"use client";

type SealDescriptionModalProps = {
  imageUrl: string;
  name: string;
  description: string;
  buttonLabel: string;
  color: string;
  onClose: () => void;
};

export default function SealDescriptionModal({
  imageUrl,
  name,
  description,
  buttonLabel,
  color,
  onClose,
}: SealDescriptionModalProps) {
  return (
    <div className="modal-backdrop">
      <section className="modal-card seal-modal-card">
        <img src={imageUrl} alt={name} />

        <h2>{name}</h2>
        <p>{description}</p>

        <button
          type="button"
          className="primary-button"
          style={{ background: color }}
          onClick={onClose}
        >
          {buttonLabel}
        </button>
      </section>
    </div>
  );
}
