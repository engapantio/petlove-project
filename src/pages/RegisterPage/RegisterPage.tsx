import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RegisterForm, type RegisterFormValues } from '../../components/RegisterForm/RegisterForm';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { register as registerUser } from '../../store/slices/authSlice';
import { resolveThunkRejectMessage } from '../../utils/mapApiErrorMessage';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector((s) => s.auth.isLoading);

  const handleRegister = async (data: RegisterFormValues) => {
    try {
      const { name, email, password } = data;
      await dispatch(registerUser({ name, email, password })).unwrap();
      navigate('/profile');
    } catch (err: unknown) {
      toast.error(resolveThunkRejectMessage(err));
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
                src="/images/cat.webp"
                alt=""
                width={60}
                height={60}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className={styles.petCardHeader}>
              <p className={styles.petName}>Jack</p>
              <p className={styles.petBirthday}>
                Birthday: <strong>18.10.2021</strong>
              </p>
            </div>
            <p className={styles.petBio}>
              Jack is a gray Persian cat with green eyes. He loves to be pampered and groomed, and
              enjoys playing with toys.
            </p>
          </aside>
        </section>

        <section className={styles.panel} aria-labelledby="register-heading">
          <RegisterForm onSubmit={handleRegister} isSubmitting={isLoading} />
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
