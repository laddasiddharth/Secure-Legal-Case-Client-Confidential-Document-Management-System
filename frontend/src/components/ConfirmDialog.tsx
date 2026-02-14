import React from 'react';
import Modal from './Modal';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
  submitting?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  submitting = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="small"
    >
      <div className="confirm-dialog">
        <div className="confirm-message">
          {message}
        </div>
        <div className="confirm-actions">
          <button
            className="btn btn-outline"
            onClick={onCancel}
            disabled={submitting}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
