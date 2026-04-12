import type { Friend } from '../../types';
import { FriendItem } from '../FriendItem/FriendItem';
import styles from './FriendsList.module.css';

interface FriendsListProps {
  items: Friend[];
}

export const FriendsList = ({ items }: FriendsListProps) => (
  <section className={styles.section} aria-label="Partner organizations">
    <ul className={styles.grid}>
      {items.map((friend) => (
        <li key={friend._id} className={styles.cell}>
          <FriendItem friend={friend} />
        </li>
      ))}
    </ul>
  </section>
);
