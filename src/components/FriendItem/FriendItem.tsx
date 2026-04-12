import type { KeyboardEvent, MouseEvent } from 'react';
import type { Friend } from '../../types';
import { buildFriendContactRows } from '../../utils/buildFriendContactRows';
import { formatFriendHours } from '../../utils/formatFriendHours';
import { resolveWebsiteUrl } from '../../utils/resolveWebsiteUrl';
import styles from './FriendItem.module.css';

interface FriendItemProps {
  friend: Friend;
}

const stopCardNav = (e: MouseEvent) => {
  e.stopPropagation();
};

export const FriendItem = ({ friend }: FriendItemProps) => {
  const websiteHref = resolveWebsiteUrl(friend.url);
  const interactive = Boolean(websiteHref);
  const scheduleLabel = formatFriendHours(friend.workDays);
  const rows = buildFriendContactRows(friend);

  const openSite = () => {
    if (!websiteHref) return;
    window.open(websiteHref, '_blank', 'noopener,noreferrer');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSite();
    }
  };

  return (
    <article
      className={[styles.card, interactive && styles.cardInteractive].filter(Boolean).join(' ')}
      {...(interactive
        ? {
            role: 'button' as const,
            tabIndex: 0,
            onClick: openSite,
            onKeyDown,
            'aria-label': `Open ${friend.title} website`,
          }
        : {})}
    >
      <div className={styles.schedulePill} aria-label="Working hours">
        <span className={styles.scheduleText}>{scheduleLabel}</span>
      </div>

      <div className={styles.inner}>
        <div className={styles.avatarWrap}>
          <img
            className={styles.avatar}
            src={friend.imageUrl}
            alt=""
            width={90}
            height={90}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className={styles.main}>
          <h2 className={styles.name}>{friend.title}</h2>

          <div className={styles.block}>
            <div className={styles.contactRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.valueCell}>
                {rows.emailHref ? (
                  <a className={styles.valueLink} href={rows.emailHref} onClick={stopCardNav}>
                    {rows.emailText}
                  </a>
                ) : (
                  <span className={styles.value}>{rows.emailText}</span>
                )}
              </span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.label}>Address: </span>
              <span className={`${styles.valueCell} ${styles.valueCellAddress}`}>
                {rows.addressHref ? (
                  <a
                    className={`${styles.valueLink} ${styles.valueLinkAddress}`}
                    href={rows.addressHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={stopCardNav}
                  >
                    {rows.addressText}
                  </a>
                ) : (
                  <span className={`${styles.value} ${styles.valueAddress}`}>{rows.addressText}</span>
                )}
              </span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.valueCell}>
                {rows.phoneHref ? (
                  <a className={styles.valueLink} href={rows.phoneHref} onClick={stopCardNav}>
                    {rows.phoneText}
                  </a>
                ) : (
                  <span className={styles.value}>{rows.phoneText}</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
