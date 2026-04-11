import Header from '../../components/layout/Header';
import styles from './HomePage.module.css';

const HERO_LEAD =
  'Choosing a pet for your home is a choice that is meant to enrich your life with immeasurable joy and tenderness.';

const HomePage = () => (
  <div className={styles.shell}>
    <div className={styles.stack}>
      <section className={styles.blockOrange} aria-labelledby="home-hero-heading">
        <Header surface="homePrimary" />
        <div className={styles.blockOrangeBody}>
          <div className={styles.copy}>
            <h1 id="home-hero-heading" className={styles.headline}>
              <span className={styles.headlineMobile}>
                <span className={styles.headlineLine}>Take good</span>
                <span className={styles.headlineLine}>
                  <span className={styles.care}>care</span> of your
                </span>
                <span className={styles.headlineLine}>small pets</span>
              </span>
              <span className={styles.headlineTabletDesktop}>
                <span className={styles.headlineLine}>
                  Take good <span className={styles.care}>care</span> of
                </span>
                <span className={styles.headlineLine}>your small pets</span>
              </span>
            </h1>
            <p className={styles.lead}>{HERO_LEAD}</p>
          </div>
        </div>
      </section>

      <div
        className={styles.blockPhoto}
        role="img"
        aria-label="Petlove hero illustration"
      />
    </div>
  </div>
);

export default HomePage;
