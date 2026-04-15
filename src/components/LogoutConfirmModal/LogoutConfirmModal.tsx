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
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={undefined}
    className={css.panel}
    headerClassName={css.header}
    closeButtonClassName={css.closeButton}
    bodyClassName={css.body}
  >
    <div className={css.content}>
      <div className={css.iconCircle} aria-hidden="true">
        <img className={css.petImage} src="/images/cat.webp" alt="" width={80} height={80} loading="lazy" decoding="async" />
      </div>
      <h3 className={css.title}>Already leaving?</h3>
      <div className={css.actions}>
        <button
          type="button"
          className={`${css.button} ${css.confirmButton}`.trim()}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Logging out...' : 'Yes'}
        </button>
        <button
          type="button"
          className={`${css.button} ${css.cancelButton}`.trim()}
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  </Modal>
);
