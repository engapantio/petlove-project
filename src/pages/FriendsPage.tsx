import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { FriendsList } from '../components/FriendsList/FriendsList';
import { FriendsListSkeleton } from '../components/FriendsList/FriendsListSkeleton';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchFriends } from '../store/slices/friendsSlice';
import css from './FriendsPage.module.css';

const FriendsPage = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((s) => s.friends);

  useEffect(() => {
    void dispatch(fetchFriends());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const showList = !isLoading && !error && items.length > 0;
  const showEmpty = !isLoading && !error && items.length === 0;

  return (
    <div className={css.page}>
      <div className={css.titleWrap}>
        <h1 className={css.title}>Our friends</h1>
      </div>

      {error && (
        <div className={css.errorWrap}>
          <p className={css.error} role="alert">
            {error}
          </p>
        </div>
      )}

      {isLoading && <FriendsListSkeleton />}

      {showEmpty && (
        <div className={css.emptyWrap}>
          <p className={css.empty}>No partner organizations to show yet. Please check back later.</p>
        </div>
      )}

      {showList && <FriendsList items={items} />}
    </div>
  );
};

export default FriendsPage;
