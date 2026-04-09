import { useState } from 'react';
import { useForm, useWatch, type SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon';
import styles from './LoginForm.module.css';

const schema = yup.object({
  email: yup
    .string()
    .matches(
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      'Enter a valid Email',
    )
    .required('Email is required'),
  password: yup
    .string()
    .min(7, 'Min 7 characters')
    .required('Password is required'),
});

export type LoginFormValues = yup.InferType<typeof schema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

type FieldVisualState = 'default' | 'error' | 'success';

export const LoginForm = ({
  onSubmit,
  isSubmitting = false,
}: LoginFormProps): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setFocus,
    control,
    formState: { errors, touchedFields },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const emailValue = useWatch({ control, name: 'email' }) ?? '';
  const passwordValue = useWatch({ control, name: 'password' }) ?? '';

  const getFieldState = (
    name: keyof LoginFormValues,
    value: string,
  ): FieldVisualState => {
    const touched = Boolean(touchedFields[name]);
    const hasError = Boolean(errors[name]);
    if (touched && hasError) return 'error';
    if (touched && !hasError && value) return 'success';
    return 'default';
  };

  const emailState = getFieldState('email', emailValue);
  const passwordState = getFieldState('password', passwordValue);

  const onInvalid: SubmitErrorHandler<LoginFormValues> = (errs) => {
    const first = (Object.keys(errs) as Array<keyof LoginFormValues>)[0];
    if (first) setFocus(first);
  };

  const wrapClass = (...classes: (string | false | undefined)[]) =>
    classes.filter(Boolean).join(' ');

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      aria-labelledby="login-heading"
    >
      <div className={styles.intro}>
        <h1 id="login-heading" className={styles.title}>
          Log in
        </h1>
        <p className={styles.subtitle}>
          Welcome! Please enter your credentials to login to the platform:
        </p>
      </div>

      <div className={styles.lower}>
        <div className={styles.fieldGroup}>
          <div className={styles.fields}>

            {/* ── Email ────────────────────────────────────── */}
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
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  className={styles.input}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
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
                  id="login-email-error"
                  className={styles.error}
                  role="alert"
                  aria-live="polite"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* ── Password ─────────────────────────────────── */}
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
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password"
                  className={styles.input}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
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
                  id="login-password-error"
                  className={styles.error}
                  role="alert"
                  aria-live="polite"
                >
                  {errors.password.message}
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
                <span className={styles.srOnly}>Logging in…</span>
              </>
            ) : (
              'LOG IN'
            )}
          </button>
        </div>

        <p className={styles.footer}>
          <span className={styles.footerMuted}>Don&apos;t have an account?</span>{' '}
          <Link to="/register" className={styles.registerLink}>
            Register
          </Link>
        </p>
      </div>
    </form>
  );
};
