import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  return (
    <div 
      className="confirm-dialog-overlay" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className={`confirm-dialog confirm-dialog-${variant}`}>
        <div className="confirm-dialog-icon">{getIcon()}</div>
        
        <h2 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h2>
        
        <p className="confirm-dialog-message">{message}</p>
        
        <div className="confirm-dialog-actions">
          <button 
            className="btn btn-outline" 
            onClick={onCancel}
            autoFocus
          >
            {cancelText}
          </button>
          <button 
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
