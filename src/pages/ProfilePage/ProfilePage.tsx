import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EditProfileModal } from '../../components/EditProfileModal';
import { Icon } from '../../components/Icon';
import { NoticeModal } from '../../components/NoticeModal';
import { LogoutConfirmModal } from '../../components/LogoutConfirmModal';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout, updateUserProfile } from '../../store/slices/authSlice';
import {
  fetchNotices,
  toggleFavorite,
} from '../../store/slices/noticesSlice';
import { markNoticeViewed } from '../../store/slices/viewedNoticesSlice';
import {
  deleteMyPet,
  fetchMyPets,
  selectMyPets,
  selectProfileHasLoaded,
  selectProfileLoading,
} from '../../store/slices/profileSlice';
import type { MyPet, Pet } from '../../types';
import css from './ProfilePage.module.css';

const formatBirthday = (value: string): string => {
  if (!value) return 'Unknown';
  const parts = value.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year && month && day) return `${day}.${month}.${year}`;
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('uk-UA');
  }

  return value;
};

const capitalize = (value: string): string =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : 'Unknown';

const buildSafeText = (value: string | undefined, fallback: string): string =>
  value && value.trim() ? value : fallback;

type ProfileNoticesTab = 'favorites' | 'viewed';

const ProfilePage = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [activeNoticesTab, setActiveNoticesTab] = useState<ProfileNoticesTab>('favorites');
  const [openNoticeId, setOpenNoticeId] = useState<string | null>(null);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);

  const user = useAppSelector((state) => state.auth.user);
  const authLoading = useAppSelector((state) => state.auth.isLoading);
  const isRefreshing = useAppSelector((state) => state.auth.isRefreshing);
  const favoriteIds = useAppSelector((state) => state.notices.favoriteIds);
  const favoriteItems = useAppSelector((state) => state.notices.favoriteItems);
  const currentUserKey = user?._id ?? user?.email ?? '';
  const viewedIds = useAppSelector(
    (state) => (currentUserKey ? state.viewedNotices.viewedByUser[currentUserKey] ?? [] : []),
  );
  const viewedCache = useAppSelector(
    (state) => (currentUserKey ? state.viewedNotices.noticeCacheByUser[currentUserKey] ?? {} : {}),
  );
  const noticeItems = useAppSelector((state) => state.notices.items);
  const pets = useAppSelector(selectMyPets);
  const petsLoading = useAppSelector(selectProfileLoading);
  const profileHasLoaded = useAppSelector(selectProfileHasLoaded);

  useEffect(() => {
    if (!user || profileHasLoaded || petsLoading) return;
    void dispatch(fetchMyPets());
  }, [dispatch, petsLoading, profileHasLoaded, user]);

  const favoriteIdSet = new Set(favoriteIds);
  const favoriteLookup = new Map<string, Pet>();
  favoriteItems.forEach((notice) => favoriteLookup.set(notice._id, notice));
  noticeItems.forEach((notice) => {
    if (!favoriteLookup.has(notice._id)) favoriteLookup.set(notice._id, notice);
  });

  const viewedLookup = new Map<string, Pet>();
  Object.values(viewedCache).forEach((notice) => viewedLookup.set(notice._id, notice));
  noticeItems.forEach((notice) => {
    if (!viewedLookup.has(notice._id)) viewedLookup.set(notice._id, notice);
  });
  const viewedMissingCount = viewedIds.filter((id) => !viewedLookup.has(id)).length;

  const favoriteCards = favoriteIds
    .map((id) => favoriteLookup.get(id))
    .filter((notice): notice is Pet => Boolean(notice));

  const favoriteMissingCount = favoriteIds.length - favoriteCards.length;
  useEffect(() => {
    if (!user || favoriteIds.length === 0 || favoriteMissingCount <= 0) return;
    void dispatch(fetchNotices({ page: 1, limit: 100 }));
  }, [dispatch, favoriteIds.length, favoriteMissingCount, user]);

  useEffect(() => {
    if (!user || viewedIds.length === 0 || viewedMissingCount === 0) return;
    void dispatch(fetchNotices({ page: 1, limit: 100 }));
  }, [dispatch, user, viewedIds.length, viewedMissingCount]);

  const handleLogoutConfirm = async (): Promise<void> => {
    setIsLogoutModalOpen(false);
    await dispatch(logout());
    navigate('/home');
  };

  const handleEditProfileSubmit = async (payload: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }): Promise<void> => {
    await dispatch(updateUserProfile(payload)).unwrap();
  };

  const handleToggleFavorite = (id: string): void => {
    const isCurrentlyFavorite = favoriteIdSet.has(id);
    if (isCurrentlyFavorite && currentUserKey) {
      const notice = favoriteLookup.get(id) ?? noticeItems.find((item) => item._id === id);
      dispatch(markNoticeViewed({ userKey: currentUserKey, noticeId: id, notice }));
    }
    void dispatch(toggleFavorite({ id, isFavorite: isCurrentlyFavorite }));
  };

  const handleOpenNotice = (id: string): void => {
    setOpenNoticeId(id);
  };

  const handleCloseNotice = (): void => {
    setOpenNoticeId(null);
  };

  const handleDeletePet = async (petId: string): Promise<void> => {
    try {
      setDeletingPetId(petId);
      await dispatch(deleteMyPet(petId)).unwrap();
      toast.success('Pet removed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove pet';
      toast.error(message);
    } finally {
      setDeletingPetId(null);
    }
  };

  const userName = buildSafeText(user?.name, 'Name');
  const userEmail = buildSafeText(user?.email, 'name@gmail.com');
  const userPhone = buildSafeText(user?.phone, '+380');
  const hasUserName = Boolean(user?.name?.trim());
  const hasUserEmail = Boolean(user?.email?.trim());
  const hasUserPhone = Boolean(user?.phone?.trim());
  const avatarSrc = user?.avatar;
  const hasAvatar = Boolean(user?.avatar?.trim());
  const hasPets = pets.length > 0;
  const viewedCards = viewedIds
    .map((id) => viewedLookup.get(id))
    .filter((notice): notice is Pet => Boolean(notice))
    .filter((notice) => !favoriteIdSet.has(notice._id));

  const activeNotices = activeNoticesTab === 'favorites' ? favoriteCards : viewedCards;
  const showNoticesCards = activeNotices.length > 0;

  return (
    <div className={css.shell}>
      <div className={css.layout}>
        <section className={css.profileCard} aria-label="Profile information">
          <div className={css.profileTop}>
            <div className={css.profileTopRow}>
              <span className={css.userChip}>
                User
                <Icon id="user-02" width={18} height={18} className={css.userChipIcon} />
              </span>

              <button
                type="button"
                className={css.editButton}
                onClick={() => setIsEditProfileModalOpen(true)}
                disabled={authLoading || isRefreshing}
                aria-label="Edit profile"
              >
                <Icon id="edit-2" width={18} height={18} />
              </button>
            </div>

            <div className={css.avatarBlock}>
              <div className={css.avatarVisual} aria-hidden="true">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${userName} avatar`}
                  className={css.avatarImage}
                  width={110}
                  height={110}
                  loading="lazy"
                />
              ) : (
                <span className={css.avatarFallback} aria-hidden="true">
                  <Icon id="user-02-empty" width={40} height={40} className={css.avatarFallbackIcon} />
                </span>
              )}
              </div>
              {!hasAvatar ? (
                <button
                  type="button"
                  className={css.avatarUploadButton}
                  onClick={() => setIsEditProfileModalOpen(true)}
                  disabled={authLoading || isRefreshing}
                >
                  <span className={css.avatarUploadText}>Upload photo</span>
                </button>
              ) : null}
            </div>
          </div>

          <section className={css.infoBlock} aria-label="My information">
            <h1 className={css.blockTitle}>My information</h1>
            <div className={css.infoFields}>
              <p className={`${css.infoField} ${hasUserName ? css.infoFieldFilled : ''}`.trim()} title={userName}>
                {userName}
              </p>
              <p className={`${css.infoField} ${hasUserEmail ? css.infoFieldFilled : ''}`.trim()} title={userEmail}>
                {userEmail}
              </p>
              <p className={`${css.infoField} ${hasUserPhone ? css.infoFieldFilled : ''}`.trim()} title={userPhone}>
                {userPhone}
              </p>
            </div>
          </section>

          <section className={css.myPetsBlock} aria-label="My pets">
            <div className={css.myPetsHeader}>
              <h2 className={css.blockTitle}>My pets</h2>
              <Link to="/add-pet" className={css.addPetLink}>
                Add pet
                <Icon id="plus" width={18} height={18} />
              </Link>
            </div>

            {!hasPets ? (
              <div className={css.myPetsEmptySpacer} aria-hidden="true" />
            ) : (
              <ul className={css.petCards}>
                {pets.map((pet: MyPet) => (
                  <li key={pet._id} className={css.petCard}>
                    <div className={css.petImageWrap}>
                      {pet.imgURL ? (
                        <img
                          src={pet.imgURL}
                          alt={buildSafeText(pet.name, 'Pet photo')}
                          className={css.petImage}
                          width={90}
                          height={90}
                          loading="lazy"
                        />
                      ) : (
                        <span className={css.petImageFallback} aria-hidden="true">
                          <Icon id="paw" width={20} height={20} />
                        </span>
                      )}
                    </div>

                    <div className={css.petInfo}>
                      <div className={css.petTopRow}>
                        <h3 className={css.petTitle}>{buildSafeText(pet.title, 'Untitled pet')}</h3>
                        <button
                          type="button"
                          className={css.petDeleteStub}
                          aria-label={`Delete ${buildSafeText(pet.name, 'pet')}`}
                          onClick={() => void handleDeletePet(pet._id)}
                          disabled={deletingPetId === pet._id}
                        >
                          <Icon id="trash-2" width={18} height={18} />
                        </button>
                      </div>

                      <ul className={css.petMeta}>
                        <li>
                          <span>Name</span>
                          <strong>{buildSafeText(pet.name, 'Unknown')}</strong>
                        </li>
                        <li>
                          <span>Birthday</span>
                          <strong>{formatBirthday(pet.birthday)}</strong>
                        </li>
                        <li>
                          <span>Sex</span>
                          <strong>{capitalize(pet.sex)}</strong>
                        </li>
                        <li>
                          <span>Species</span>
                          <strong>{capitalize(pet.species)}</strong>
                        </li>
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <button
            type="button"
            className={css.logoutButton}
            onClick={() => setIsLogoutModalOpen(true)}
            disabled={authLoading || isRefreshing}
          >
            Log out
          </button>
        </section>

        <section className={css.favoritesSection} aria-label="Notices area">
          <div className={css.favoritesTabs}>
            <button
              type="button"
              className={`${css.favoritesTab} ${activeNoticesTab === 'favorites' ? css.favoritesTabActive : ''}`.trim()}
              onClick={() => setActiveNoticesTab('favorites')}
            >
              My favorite pets
            </button>
            <button
              type="button"
              className={`${css.favoritesTab} ${activeNoticesTab === 'viewed' ? css.favoritesTabActive : ''}`.trim()}
              onClick={() => setActiveNoticesTab('viewed')}
            >
              Viewed
            </button>
          </div>

          {!showNoticesCards ? (
            <p className={css.favoritesEmptyText}>
              Oops, <span className={css.favoritesEmptyHighlight}>looks like there aren&apos;t any furries</span> on
              our adorable page yet. Do not worry! View your pets on the &quot;find your favorite pet&quot; page and add
              them to your favorites.
            </p>
          ) : (
            <ul className={css.favoritesCards}>
              {activeNotices.map((notice) => (
                <li key={`profile-notice-${notice._id}`} className={css.favoriteCard}>
                  <div className={css.favoriteImageWrap}>
                    {notice.imgURL ? (
                      <img
                        src={notice.imgURL}
                        alt={buildSafeText(notice.title, 'Notice')}
                        className={css.favoriteImage}
                        width={314}
                        height={162}
                        loading="lazy"
                      />
                    ) : (
                      <span className={css.favoriteImageFallback} aria-hidden="true">
                        <Icon id="paw" width={30} height={30} />
                      </span>
                    )}
                  </div>
                  <div className={css.favoriteCardBody}>
                    <h3 className={css.favoriteTitle}>{buildSafeText(notice.title, 'Notice')}</h3>
                    <div className={css.favoriteRating}>
                      <span className={css.favoriteStar} aria-hidden="true">
                        ★
                      </span>
                      <span>{notice.popularity ?? 0}</span>
                    </div>
                    <ul className={css.favoriteMeta}>
                      <li>
                        <span>Name</span>
                        <strong>{buildSafeText(notice.name, 'Unknown')}</strong>
                      </li>
                      <li>
                        <span>Birthday</span>
                        <strong>{formatBirthday(notice.birthday)}</strong>
                      </li>
                      <li>
                        <span>Sex</span>
                        <strong>{capitalize(notice.sex)}</strong>
                      </li>
                      <li>
                        <span>Species</span>
                        <strong>{capitalize(notice.species)}</strong>
                      </li>
                      <li>
                        <span>Category</span>
                        <strong>{capitalize(notice.category)}</strong>
                      </li>
                    </ul>
                    <p className={css.favoriteDescription}>
                      {buildSafeText(notice.comment, 'No description provided.')}
                    </p>
                  </div>
                  <div
                    className={`${css.favoriteActions} ${
                      activeNoticesTab === 'favorites' ? css.favoriteActionsWithDelete : ''
                    }`.trim()}
                  >
                    <p className={css.favoritePrice}>
                      {typeof notice.price === 'number' ? `$${notice.price.toFixed(2)}` : ''}
                    </p>
                    <button
                      type="button"
                      className={css.favoriteLearnButton}
                      onClick={() => handleOpenNotice(notice._id)}
                    >
                      Learn more
                    </button>
                    {activeNoticesTab === 'favorites' ? (
                      <button
                        type="button"
                        className={css.favoriteDeleteStub}
                        aria-label="Remove from favorites"
                        onClick={() => handleToggleFavorite(notice._id)}
                      >
                        <Icon id="trash-2" width={18} height={18} />
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isLoading={authLoading}
        onConfirm={() => void handleLogoutConfirm()}
        onClose={() => setIsLogoutModalOpen(false)}
      />
      <NoticeModal
        isOpen={openNoticeId !== null}
        noticeId={openNoticeId}
        isFavorite={openNoticeId ? favoriteIdSet.has(openNoticeId) : false}
        onToggleFavorite={handleToggleFavorite}
        onClose={handleCloseNotice}
      />
      {isEditProfileModalOpen ? (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          isLoading={authLoading || isRefreshing}
          user={user}
          onSubmit={handleEditProfileSubmit}
          onClose={() => setIsEditProfileModalOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default ProfilePage;
