import styles from './FriendsList.module.css';

const PLACEHOLDER_COUNT = 6;

const SkeletonCard = () => (
  <div className={styles.skelCard} aria-hidden>
    <div className={styles.skelInner}>
      <div className={styles.skelAvatar} />
      <div className={styles.skelCol}>
        <div className={`${styles.skelBlock} ${styles.skelLineTitle}`} />
        <div className={`${styles.skelBlock} ${styles.skelLine} ${styles.skelLineMid}`} />
        <div className={`${styles.skelBlock} ${styles.skelLine} ${styles.skelLineShort}`} />
      </div>
    </div>
  </div>
);

export const FriendsListSkeleton = () => (
  <section className={styles.section} aria-busy="true" aria-label="Loading partners">
    <ul className={styles.grid}>
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
        <li key={i} className={styles.cell}>
          <SkeletonCard />
        </li>
      ))}
    </ul>
  </section>
);
