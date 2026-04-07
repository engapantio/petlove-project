import { useMemo, useState } from 'react';
import type { NoticeCardItem } from '../../types';
import { Icon } from '../Icon';
import css from './NoticeCard.module.css';

interface NoticeCardProps {
  item: NoticeCardItem;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onLearnMore?: (id: string) => void;
  /** Used when item.imgURL is missing or fails to load. */
  fallbackImageSrc?: string;
}

const formatBirthday = (birthday: string): string => {
  const raw = birthday.trim();
  // API commonly returns YYYY-MM-DD; Figma expects mm.dd.yyyy.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [yyyy, mm, dd] = raw.split('-');
    return `${mm}.${dd}.${yyyy}`;
  }
  // Already formatted as mm.dd.yyyy — keep.
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) return raw;

  // Best-effort parse for ISO strings; fallback to original string.
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return birthday;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${mm}.${dd}.${yyyy}`;
};

const capitalizeFirst = (s: string): string => {
  const v = s.trim();
  if (!v) return s;
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const formatPrice = (price?: number): string | null => {
  if (price === undefined || Number.isNaN(price)) return null;
  return `$${price.toFixed(2)}`;
};

const formatSex = (sex: NoticeCardItem['sex']): string => {
  if (sex === 'male') return 'Male';
  if (sex === 'female') return 'Female';
  return 'Unknown';
};

const formatCategory = (category: NoticeCardItem['category']): string => {
  if (category === 'sell') return 'Sell';
  if (category === 'lost') return 'Lost';
  if (category === 'found') return 'Found';
  return 'Free';
};

export const NoticeCard = ({
  item,
  isFavorite = false,
  onToggleFavorite,
  onLearnMore,
  fallbackImageSrc,
}: NoticeCardProps): React.ReactElement => {
  const [imgError, setImgError] = useState(false);

  const transparentPixel =
    'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

  const imgSrc = useMemo(() => {
    const fallback =
      fallbackImageSrc && fallbackImageSrc.trim().length > 0
        ? fallbackImageSrc
        : transparentPixel;

    if (imgError) return fallback;
    return item.imgURL && item.imgURL.trim().length > 0 ? item.imgURL : fallback;
  }, [fallbackImageSrc, imgError, item.imgURL, transparentPixel]);

  const ratingValue = item.popularity ?? 0;
  const priceLabel = formatPrice(item.price);

  return (
    <article className={css.card}>
      <div className={css.imageWrap}>
        <img
          className={css.image}
          src={imgSrc}
          alt={item.title}
          width={315}
          height={178}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      </div>

      <div className={css.body}>
        <div className={css.headerRow}>
          <h3 className={css.title} title={item.title}>
            {item.title}
          </h3>

          <div className={css.rating} aria-label={`Rating ${ratingValue}`}>
            <span className={css.starIcon} aria-hidden="true">
              ★
            </span>
            <span className={css.ratingValue}>{ratingValue}</span>
          </div>
        </div>

        <ul className={css.meta} aria-label="Notice details">
          <li className={css.metaItem}>
            <span className={css.metaLabel}>Name</span>
            <span className={css.metaValue}>{item.name}</span>
          </li>
          <li className={css.metaItem}>
            <span className={css.metaLabel}>Birthday</span>
            <span className={`${css.metaValue} ${css.metaValueNoWrap}`}>
              {formatBirthday(item.birthday)}
            </span>
          </li>
          <li className={css.metaItem}>
            <span className={css.metaLabel}>Sex</span>
            <span className={css.metaValue}>{formatSex(item.sex)}</span>
          </li>
          <li className={css.metaItem}>
            <span className={css.metaLabel}>Species</span>
            <span className={css.metaValue}>{capitalizeFirst(item.species)}</span>
          </li>
          <li className={css.metaItem}>
            <span className={css.metaLabel}>Category</span>
            <span className={css.metaValue}>{formatCategory(item.category)}</span>
          </li>
        </ul>

        <p className={css.comment} title={item.comment}>
          {item.comment}
        </p>

        <div className={css.footer}>
          <div className={css.price} aria-label={priceLabel ? `Price ${priceLabel}` : 'No price'}>
            {priceLabel ?? ''}
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.learnMore}
              onClick={() => onLearnMore?.(item._id)}
            >
              Learn more
            </button>

            <button
              type="button"
              className={css.favorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => onToggleFavorite?.(item._id)}
            >
              <Icon id={isFavorite ? 'heart-filled' : 'heart'} width={18} height={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

