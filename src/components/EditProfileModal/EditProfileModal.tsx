import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../Modal';
import type { User } from '../../types';
import css from './EditProfileModal.module.css';

interface EditProfileModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
    setAvatarFile(null);
  }, [isOpen, user?.email, user?.name, user?.phone]);

  const hasChanges = useMemo(() => {
    const changedName = name.trim() !== (user?.name ?? '');
    const changedEmail = email.trim() !== (user?.email ?? '');
    const changedPhone = phone.trim() !== (user?.phone ?? '');
    return changedName || changedEmail || changedPhone || Boolean(avatarFile);
  }, [avatarFile, email, name, phone, user?.email, user?.name, user?.phone]);

  if (!isOpen) return null;

  const handleSave = async (): Promise<void> => {
    const formData = new FormData();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();

    if (normalizedName !== (user?.name ?? '')) formData.append('name', normalizedName);
    if (normalizedEmail !== (user?.email ?? '')) formData.append('email', normalizedEmail);
    if (normalizedPhone !== (user?.phone ?? '')) formData.append('phone', normalizedPhone);
    if (avatarFile) formData.append('avatar', avatarFile);

    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      await onSubmit(formData);
      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit profile" className={css.panel}>
      <div className={css.content}>
        <label className={css.field}>
          <span className={css.label}>Name</span>
          <input
            className={css.input}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            disabled={isLoading}
          />
        </label>

        <label className={css.field}>
          <span className={css.label}>Email</span>
          <input
            className={css.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            disabled={isLoading}
          />
        </label>

        <label className={css.field}>
          <span className={css.label}>Phone</span>
          <input
            className={css.input}
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+380"
            disabled={isLoading}
          />
        </label>

        <label className={css.field}>
          <span className={css.label}>Avatar</span>
          <input
            className={css.input}
            type="file"
            accept="image/*"
            onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
            disabled={isLoading}
          />
        </label>

        <div className={css.actions}>
          <button type="button" className={`${css.button} ${css.cancel}`.trim()} onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            type="button"
            className={`${css.button} ${css.save}`.trim()}
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
