"use client"
import "./Modal.css"

const Modal = ({ isOpen, title, children, onClose, onSubmit }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close">
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {onSubmit && (
          <div className="modal-footer">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={onSubmit} className="btn-primary">
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
