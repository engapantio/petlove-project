import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginForm, type LoginFormValues } from '../../components/LoginForm/LoginForm';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login } from '../../store/slices/authSlice';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector((s) => s.auth.isLoading);

  const handleLogin = async (data: LoginFormValues) => {
    try {
      await dispatch(login(data)).unwrap();
      navigate('/profile');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.grid}>
        <section className={styles.hero} aria-label="Featured pet">
          <aside className={styles.petCard}>
            <div className={styles.petAvatar} aria-hidden="true">
              <img
                className={styles.petAvatarImg}
                src="/images/dog.webp"
                alt=""
                width={60}
                height={60}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className={styles.petCardHeader}>
              <p className={styles.petName}>Rich</p>
              <p className={styles.petBirthday}>
                Birthday: <strong>21.09.2020</strong>
              </p>
            </div>
            <p className={styles.petBio}>
              Rich would be the perfect addition to an active family that loves to play and go on
              walks. I bet he would love having a doggy playmate too!
            </p>
          </aside>
        </section>

        <section className={styles.panel} aria-labelledby="login-heading">
          <LoginForm onSubmit={handleLogin} isSubmitting={isLoading} />
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
