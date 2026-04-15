import { useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '../Icon';
import { Modal } from '../Modal';
import type { User } from '../../types';
import css from './EditProfileModal.module.css';

const imageUrlRegex = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp)$/;

interface EditProfileModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (data: { name?: string; email?: string; phone?: string; avatar?: string }) => Promise<void>;
}

export const EditProfileModal = ({
  isOpen,
  isLoading = false,
  user,
  onClose,
  onSubmit,
}: EditProfileModalProps): React.ReactElement | null => {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? '');
  const [avatarError, setAvatarError] = useState('');
  const avatarUrlInputRef = useRef<HTMLInputElement>(null);

  const resetFormState = (sourceUser: User | null): void => {
    setName(sourceUser?.name ?? '');
    setEmail(sourceUser?.email ?? '');
    setPhone(sourceUser?.phone ?? '');
    setAvatarUrl(sourceUser?.avatar ?? '');
    setAvatarError('');
  };

  const handleClose = (): void => {
    resetFormState(user);
    onClose();
  };

  const hasChanges = useMemo(() => {
    const changedName = name.trim() !== (user?.name ?? '');
    const changedEmail = email.trim() !== (user?.email ?? '');
    const changedPhone = phone.trim() !== (user?.phone ?? '');
    const changedAvatar = avatarUrl.trim() !== (user?.avatar ?? '');
    return changedName || changedEmail || changedPhone || changedAvatar;
  }, [avatarUrl, email, name, phone, user?.avatar, user?.email, user?.name, user?.phone]);

  if (!isOpen) return null;

  const handleSave = async (): Promise<void> => {
    const payload: { name?: string; email?: string; phone?: string; avatar?: string } = {};
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const normalizedAvatar = avatarUrl.trim();

    if (normalizedAvatar && !imageUrlRegex.test(normalizedAvatar)) {
      setAvatarError('Invalid image URL');
      return;
    }
    setAvatarError('');

    if (normalizedName !== (user?.name ?? '')) payload.name = normalizedName;
    if (normalizedEmail !== (user?.email ?? '')) payload.email = normalizedEmail;
    if (normalizedPhone !== (user?.phone ?? '')) payload.phone = normalizedPhone;
    if (normalizedAvatar !== (user?.avatar ?? '')) payload.avatar = normalizedAvatar;

    if (!hasChanges) {
      handleClose();
      return;
    }

    try {
      await onSubmit(payload);
      toast.success('Profile updated successfully');
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    }
  };

  const avatarSrc = avatarUrl.trim();
  const hasAvatarSrc = avatarSrc.trim().length > 0;
  const hasAvatarSourceText = avatarUrl.trim().length > 0;
  const isNameFilled = name.trim().length > 0;
  const isEmailFilled = email.trim().length > 0;
  const isPhoneFilled = phone.trim().length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={undefined}
      className={css.panel}
      headerClassName={css.header}
      closeButtonClassName={css.closeButton}
      bodyClassName={css.body}
    >
      <div className={css.content}>
        <div className={css.infoGroup}>
          <h3 className={css.title}>Edit information</h3>
          <div className={css.avatarGroup}>
            <div className={css.avatarCircle} aria-hidden="true">
              {hasAvatarSrc ? (
                <img
                  className={css.avatarImage}
                  src={avatarSrc}
                  alt={`${user?.name ?? 'User'} avatar`}
                  width={86}
                  height={86}
                  loading="lazy"
                />
              ) : (
                <Icon id="user-02-empty" width={40} height={40} className={css.avatarFallbackIcon} />
              )}
            </div>
            <div className={css.uploadRow}>
              <input
                ref={avatarUrlInputRef}
                className={`${css.avatarSource} ${hasAvatarSourceText ? css.filled : ''}`.trim()}
                placeholder="Enter URL"
                type="text"
                value={avatarUrl}
                onChange={(event) => {
                  setAvatarUrl(event.target.value);
                  if (avatarError) setAvatarError('');
                }}
                onBlur={() => {
                  const nextValue = avatarUrl.trim();
                  if (nextValue && !imageUrlRegex.test(nextValue)) {
                    setAvatarError('Invalid image URL');
                    return;
                  }
                  setAvatarError('');
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                className={css.uploadButton}
                onClick={() => avatarUrlInputRef.current?.focus()}
                disabled={isLoading}
              >
                <span className={css.uploadText}>Upload photo</span>
                <Icon id="upload-cloud" width={18} height={18} className={css.uploadIcon} />
              </button>
            </div>
            {avatarError ? <p className={css.error}>{avatarError}</p> : null}
          </div>
        </div>

        <div className={css.fields}>
          <input
            className={`${css.input} ${isNameFilled ? css.filled : ''}`.trim()}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            disabled={isLoading}
          />
          <input
            className={`${css.input} ${isEmailFilled ? css.filled : ''}`.trim()}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            disabled={isLoading}
          />
          <input
            className={`${css.input} ${isPhoneFilled ? css.filled : ''}`.trim()}
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+380"
            disabled={isLoading}
          />
        </div>

        <div className={css.actions}>
          <button
            type="button"
            className={css.saveButton}
            onClick={() => void handleSave()}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
