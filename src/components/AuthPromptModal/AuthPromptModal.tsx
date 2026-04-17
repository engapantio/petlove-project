import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../Modal';
import css from './AuthPromptModal.module.css';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BODY_COPY =
  'We would like to remind you that certain functionality is available only to authorized users.If you have an account, please log in with your credentials. If you do not already have an account, you must register to access these features.';

export const AuthPromptModal = ({ isOpen, onClose }: AuthPromptModalProps): React.ReactElement | null => {
  const navigate = useNavigate();

  const goLogin = useCallback(() => {
    onClose();
    navigate('/login');
  }, [navigate, onClose]);

  const goRegister = useCallback(() => {
    onClose();
    navigate('/register');
  }, [navigate, onClose]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={undefined}
      className={css.panel}
      headerClassName={css.header}
      closeButtonClassName={css.closeButton}
      bodyClassName={css.modalBody}
    >
      <div className={css.root}>
        <div className={css.iconWrap} aria-hidden="true">
          <div className={css.iconCircle}>
            <img
              className={css.authPetImg}
              src="/images/dog.webp"
              alt=""
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className={css.textBlock}>
          <p className={css.title}>Attention</p>
          <p className={css.bodyText}>{BODY_COPY}</p>
        </div>

        <div className={css.actions}>
          <button type="button" className={css.primaryBtn} onClick={goLogin}>
            Log In
          </button>
          <button type="button" className={css.secondaryBtn} onClick={goRegister}>
            Registration
          </button>
        </div>
      </div>
    </Modal>
  );
};

