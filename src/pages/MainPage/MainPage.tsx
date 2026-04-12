import { NavLink } from 'react-router-dom';
import { Icon } from '../../components/Icon/Icon';
import { MainStyleBackground } from '../../components/MainStyleBackground';
import headerStyles from '../../components/layout/Header.module.css';
import styles from './MainPage.module.css';

const MainPage = () => (
  <div className={styles.root}>
    <MainStyleBackground heroFetchPriority="high">
      <div className={styles.logoWrap}>
        <NavLink
          to="/home"
          className={[
            headerStyles.logo,
            headerStyles.logoOnPrimary,
            styles.mainLogoLink,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label="Petlove home"
        >
          <span className={headerStyles.logoWordmark}>
            petl
            <Icon
              id="heart-filled"
              width={82}
              height={82}
              className={headerStyles.logoHeart}
            />
            ve
          </span>
        </NavLink>
      </div>
    </MainStyleBackground>
  </div>
);

export default MainPage;
