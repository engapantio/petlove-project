import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => (
  <div className={styles.page}>
    <div className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.hero404} aria-hidden="true">
          <span className={styles.digit}>4</span>
          <div className={styles.imageFrame}>
            <picture>
              <source media="(min-width: 1280px)" srcSet="/images/Desktop-404-image.webp" />
              <source media="(min-width: 768px)" srcSet="/images/Tablet-404-image.webp" />
              <img src="/images/Mobile-404-image.webp" alt="" width={280} height={280} decoding="async" />
            </picture>
          </div>
          <span className={styles.digit}>4</span>
        </div>
        <h1 className={styles.title}>Ooops! This page not found :(</h1>
        <Link to="/" className={styles.cta}>
          To home page
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
