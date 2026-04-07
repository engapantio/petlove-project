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

const formatBirthday = (birthday: string): string => birthday;

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

        <dl className={css.meta}>
          <div className={css.metaItem}>
            <dt className={css.metaLabel}>Name</dt>
            <dd className={css.metaValue}>{item.name}</dd>
          </div>
          <div className={css.metaItem}>
            <dt className={css.metaLabel}>Birthday</dt>
            <dd className={css.metaValue}>{formatBirthday(item.birthday)}</dd>
          </div>
          <div className={css.metaItem}>
            <dt className={css.metaLabel}>Sex</dt>
            <dd className={css.metaValue}>{formatSex(item.sex)}</dd>
          </div>
          <div className={css.metaItem}>
            <dt className={css.metaLabel}>Species</dt>
            <dd className={css.metaValue}>{item.species}</dd>
          </div>
          <div className={css.metaItem}>
            <dt className={css.metaLabel}>Category</dt>
            <dd className={css.metaValue}>{formatCategory(item.category)}</dd>
          </div>
        </dl>

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

