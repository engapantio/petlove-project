import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
      'Invalid email',
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

export const LoginForm = ({
  onSubmit,
  isSubmitting = false,
}: LoginFormProps): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
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
            <div className={styles.field}>
              <div className={styles.inputWrap}>
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
              </div>
              {errors.email && (
                <p id="login-email-error" className={styles.error} role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <div className={`${styles.inputWrap} ${styles.inputWrapPassword}`}>
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
                  className={styles.togglePw}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  <Icon id={showPassword ? 'eye-off' : 'eye'} width={22} height={22} />
                </button>
              </div>
              {errors.password && (
                <p id="login-password-error" className={styles.error} role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            LOG IN
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
