import { Modal } from '../Modal';
import css from './LogoutConfirmModal.module.css';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const LogoutConfirmModal = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}: LogoutConfirmModalProps): React.ReactElement => (
  <Modal isOpen={isOpen} onClose={onClose} title="Log out">
    <div className={css.content}>
      <p className={css.text}>Are you sure you want to log out?</p>
      <div className={css.actions}>
        <button
          type="button"
          className={`${css.button} ${css.cancelButton}`.trim()}
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`${css.button} ${css.confirmButton}`.trim()}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  </Modal>
);
