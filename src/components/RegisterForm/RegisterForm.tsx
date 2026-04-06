import { useState } from 'react';
import { useForm, type SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon';
import styles from './RegisterForm.module.css';

const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup
    .string()
    .matches(emailRegex, 'Enter a valid Email')
    .required('Email is required'),
  password: yup
    .string()
    .min(7, 'Min 7 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

export type RegisterFormValues = yup.InferType<typeof schema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

type FieldVisualState = 'default' | 'error' | 'success';

export const RegisterForm = ({
  onSubmit,
  isSubmitting = false,
}: RegisterFormProps): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setFocus,
    watch,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const nameValue = watch('name');
  const emailValue = watch('email');
  const passwordValue = watch('password');
  const confirmValue = watch('confirmPassword');

  const getFieldState = (
    name: keyof RegisterFormValues,
    value: string,
  ): FieldVisualState => {
    const touched = Boolean(touchedFields[name]);
    const hasError = Boolean(errors[name]);
    if (touched && hasError) return 'error';
    if (touched && !hasError && value) return 'success';
    return 'default';
  };

  const nameState = getFieldState('name', nameValue);
  const emailState = getFieldState('email', emailValue);
  const passwordState = getFieldState('password', passwordValue);
  const confirmState = getFieldState('confirmPassword', confirmValue);

  const onInvalid: SubmitErrorHandler<RegisterFormValues> = (errs) => {
    const first = (Object.keys(errs) as Array<keyof RegisterFormValues>)[0];
    if (first) setFocus(first);
  };

  const wrapClass = (...classes: (string | false | undefined)[]) =>
    classes.filter(Boolean).join(' ');

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      aria-labelledby="register-heading"
    >
      <div className={styles.intro}>
        <h1 id="register-heading" className={styles.title}>
          Registration
        </h1>
        <p className={styles.subtitle}>
          Thank you for your interest in our platform.
        </p>
      </div>

      <div className={styles.lower}>
        <div className={styles.fieldGroup}>
          <div className={styles.fields}>

            {/* ── Name ──────────────────────────────────────── */}
            <div className={styles.field}>
              <div
                className={wrapClass(
                  styles.inputWrap,
                  nameState === 'error' && styles.inputWrapError,
                  nameState === 'success' && styles.inputWrapSuccess,
                  nameState !== 'default' && styles.inputWrapWithTrail,
                )}
              >
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Name"
                  className={styles.input}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'register-name-error' : undefined}
                  {...register('name')}
                />
                {nameState !== 'default' && (
                  <span
                    className={wrapClass(
                      styles.inputTrail,
                      nameState === 'error'
                        ? styles.inputTrailError
                        : styles.inputTrailSuccess,
                    )}
                    aria-hidden="true"
                  >
                    <Icon
                      id={nameState === 'error' ? 'cross-small' : 'check'}
                      width={22}
                      height={22}
                    />
                  </span>
                )}
              </div>
              {errors.name && (
                <p
                  id="register-name-error"
                  className={styles.error}
                  role="alert"
                  aria-live="polite"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* ── Email ─────────────────────────────────────── */}
            <div className={styles.field}>
              <div
                className={wrapClass(
                  styles.inputWrap,
                  emailState === 'error' && styles.inputWrapError,
                  emailState === 'success' && styles.inputWrapSuccess,
                  emailState !== 'default' && styles.inputWrapWithTrail,
                )}
              >
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  className={styles.input}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'register-email-error' : undefined}
                  {...register('email')}
                />
                {emailState !== 'default' && (
                  <span
                    className={wrapClass(
                      styles.inputTrail,
                      emailState === 'error'
                        ? styles.inputTrailError
                        : styles.inputTrailSuccess,
                    )}
                    aria-hidden="true"
                  >
                    <Icon
                      id={emailState === 'error' ? 'cross-small' : 'check'}
                      width={22}
                      height={22}
                    />
                  </span>
                )}
              </div>
              {errors.email && (
                <p
                  id="register-email-error"
                  className={styles.error}
                  role="alert"
                  aria-live="polite"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* ── Password ──────────────────────────────────── */}
            <div className={styles.field}>
              <div
                className={wrapClass(
                  styles.inputWrap,
                  styles.inputWrapPassword,
                  passwordState === 'error' && styles.inputWrapError,
                  passwordState === 'success' && styles.inputWrapSuccess,
                )}
              >
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Password"
                  className={styles.input}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'register-password-error' : undefined}
                  {...register('password')}
                />
                <button
                  type="button"
                  className={wrapClass(
                    styles.togglePw,
                    passwordState === 'error' && styles.togglePwError,
                    passwordState === 'success' && styles.togglePwSuccess,
                  )}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  <Icon id={showPassword ? 'eye-off' : 'eye'} width={22} height={22} />
                </button>
              </div>
              {errors.password && (
                <p
                  id="register-password-error"
                  className={styles.error}
                  role="alert"
                  aria-live="polite"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* ── Confirm Password ──────────────────────────── */}
            <div className={styles.field}>
              <div
                className={wrapClass(
                  styles.inputWrap,
                  styles.inputWrapPassword,
                  confirmState === 'error' && styles.inputWrapError,
                  confirmState === 'success' && styles.inputWrapSuccess,
                )}
              >
                <input
                  id="register-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  className={styles.input}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className={wrapClass(
                    styles.togglePw,
                    confirmState === 'error' && styles.togglePwError,
                    confirmState === 'success' && styles.togglePwSuccess,
                  )}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  aria-pressed={showConfirm}
                >
                  <Icon id={showConfirm ? 'eye-off' : 'eye'} width={22} height={22} />
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="register-confirm-error"
                  className={styles.error}
                  role="alert"
                  aria-live="polite"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

          </div>

          <button
            type="submit"
            className={styles.submit}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span className={styles.srOnly}>Registering…</span>
              </>
            ) : (
              'REGISTRATION'
            )}
          </button>
        </div>

        <p className={styles.footer}>
          <span className={styles.footerMuted}>Already have an account?</span>{' '}
          <Link to="/login" className={styles.loginLink}>
            Login
          </Link>
        </p>
      </div>
    </form>
  );
};
