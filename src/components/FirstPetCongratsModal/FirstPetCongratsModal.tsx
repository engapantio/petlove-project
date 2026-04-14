import { Modal } from '../Modal';
import css from './FirstPetCongratsModal.module.css';

interface FirstPetCongratsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToProfile: () => void;
}

const BODY_COPY =
  'The first fluff in the favorites! May your friendship be the happiest and filled with fun.';

export const FirstPetCongratsModal = ({
  isOpen,
  onClose,
  onGoToProfile,
}: FirstPetCongratsModalProps): React.ReactElement | null => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={undefined} className={css.panel}>
      <div className={css.root}>
        <div className={css.iconWrap} aria-hidden="true">
          <div className={css.iconCircle}>
            <img
              className={css.petImg}
              src="/images/cat.webp"
              alt=""
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className={css.textBlock}>
          <p className={css.title}>Congrats</p>
          <p className={css.body}>{BODY_COPY}</p>
        </div>

        <button type="button" className={css.primaryBtn} onClick={onGoToProfile}>
          Go to profile
        </button>
      </div>
    </Modal>
  );
};

