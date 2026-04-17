import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { Icon } from '../Icon';
import { Modal } from '../Modal';
import type { User } from '../../types';
import css from './EditProfileModal.module.css';

const imageUrlRegex = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp)$/;
const phoneDigitsRegex = /^\+38\d{10}$/;
const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

interface EditProfileFormValues {
  name: string;
  email: string;
  avatar: string;
  phone: string;
}

const editUserSchema: yup.ObjectSchema<EditProfileFormValues> = yup.object({
  name: yup.string().defined(),
  email: yup
    .string()
    .matches(emailRegex, { message: 'Invalid email', excludeEmptyString: true })
    .defined(),
  avatar: yup
    .string()
    .matches(imageUrlRegex, { message: 'Invalid image URL', excludeEmptyString: true })
    .defined(),
  phone: yup
    .string()
    .matches(phoneDigitsRegex, { message: 'Format: +38XXXXXXXXXX', excludeEmptyString: true })
    .defined(),
});

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
  const avatarUrlInputRef = useRef<HTMLInputElement>(null);
  const wasModalOpenRef = useRef(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: yupResolver(editUserSchema),
    mode: 'onBlur',
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      avatar: user?.avatar ?? '',
    },
  });

  const name = watch('name') ?? '';
  const email = watch('email') ?? '';
  const phone = watch('phone') ?? '';
  const avatarUrl = watch('avatar') ?? '';

  const normalizePhone = (value: string): string =>
    value.replace(/\s+/g, '').replace(/[-()]/g, '');

  const resetFormState = useCallback((sourceUser: User | null): void => {
    reset({
      name: sourceUser?.name ?? '',
      email: sourceUser?.email ?? '',
      phone: sourceUser?.phone ?? '',
      avatar: sourceUser?.avatar ?? '',
    });
  }, [reset]);

  useEffect(() => {
    if (!isOpen) {
      wasModalOpenRef.current = false;
      return;
    }
    if (!wasModalOpenRef.current) {
      resetFormState(user);
    }
    wasModalOpenRef.current = true;
  }, [isOpen, resetFormState, user]);

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

  const handleSave = async (values: EditProfileFormValues): Promise<void> => {
    const payload: { name?: string; email?: string; phone?: string; avatar?: string } = {};
    const normalizedName = (values.name ?? '').trim();
    const normalizedEmail = (values.email ?? '').trim();
    const normalizedPhone = normalizePhone((values.phone ?? '').trim());
    const normalizedAvatar = (values.avatar ?? '').trim();

    if (normalizedName !== (user?.name ?? '')) payload.name = normalizedName;
    if (normalizedEmail !== (user?.email ?? '')) payload.email = normalizedEmail;
    if (normalizedPhone !== normalizePhone(user?.phone ?? '')) payload.phone = normalizedPhone;
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
  const avatarField = register('avatar');

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
      <form className={css.content} onSubmit={handleSubmit(handleSave)} noValidate>
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
                {...avatarField}
                ref={(element) => {
                  avatarField.ref(element);
                  avatarUrlInputRef.current = element;
                }}
                className={`${css.avatarSource} ${hasAvatarSourceText ? css.filled : ''}`.trim()}
                placeholder="Enter URL"
                type="text"
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
            {errors.avatar ? <p className={css.error}>{errors.avatar.message}</p> : null}
          </div>
        </div>

        <div className={css.fields}>
          <input
            className={`${css.input} ${isNameFilled ? css.filled : ''}`.trim()}
            type="text"
            {...register('name')}
            placeholder="Name"
            disabled={isLoading}
          />
          <input
            className={`${css.input} ${isEmailFilled ? css.filled : ''}`.trim()}
            type="email"
            {...register('email')}
            placeholder="Email"
            disabled={isLoading}
          />
          {errors.email ? <p className={css.error}>{errors.email.message}</p> : null}
          <input
            className={`${css.input} ${isPhoneFilled ? css.filled : ''} ${errors.phone ? css.inputError : ''}`.trim()}
            type="tel"
            {...register('phone')}
            placeholder="+38"
            disabled={isLoading}
          />
          <p className={css.helperText}>Format: +38XXXXXXXXXX</p>
          {errors.phone ? <p className={css.error}>{errors.phone.message}</p> : null}
        </div>

        <div className={css.actions}>
          <button
            type="submit"
            className={css.saveButton}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
