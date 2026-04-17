import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { NoticeDetails } from '../../types';
import { getNoticeByIdApi } from '../../api/notices';
import { Modal } from '../Modal';
import { Icon } from '../Icon';
import css from './NoticeModal.module.css';

interface NoticeModalProps {
  isOpen: boolean;
  noticeId: string | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}

const transparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

const getImageSrc = (d: NoticeDetails | null): string => {
  const src = d?.imgURL ?? d?.imgUrl ?? '';
  return src.trim().length > 0 ? src : transparentPixel;
};

const clampRating = (v: number): number => Math.max(0, Math.min(5, v));
const capitalizeFirst = (value: string | null | undefined): string => {
  const normalized = (value ?? '').trim();
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const NoticeModal = ({
  isOpen,
  noticeId,
  isFavorite,
  onToggleFavorite,
  onClose,
}: NoticeModalProps): React.ReactElement | null => {
  const [data, setData] = useState<NoticeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const imgSrc = useMemo(() => getImageSrc(data), [data]);
  const categoryLabel = useMemo(() => (data?.category ? data.category : ''), [data?.category]);
  const rating = useMemo(() => clampRating(Math.round(data?.popularity ?? 0)), [data?.popularity]);

  const fetchDetails = useCallback(async (id: string) => {
    const requestSeq = ++requestSeqRef.current;
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await getNoticeByIdApi(id);
      if (requestSeq !== requestSeqRef.current) return;
      setData(res.data);
    } catch (e: unknown) {
      if (requestSeq !== requestSeqRef.current) return;
      const message = (e as Error).message || 'Failed to load notice details';
      setError(message);
      setData(null);
    } finally {
      if (requestSeq === requestSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !noticeId) {
      requestSeqRef.current += 1;
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    void fetchDetails(noticeId);
  }, [fetchDetails, isOpen, noticeId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleRetry = () => {
    if (!noticeId) return;
    void fetchDetails(noticeId);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={undefined}
      className={css.panel}
      headerClassName={css.header}
      closeButtonClassName={css.closeButton}
      bodyClassName={css.modalBody}
    >
      <div className={css.root}>
        <div className={css.hero}>
          <div className={css.imageWrap}>
            <img
              className={css.image}
              src={imgSrc}
              alt={data?.title ?? 'Notice'}
              width={150}
              height={150}
              loading="lazy"
              decoding="async"
            />
            {categoryLabel ? (
              <div className={css.categoryPill} aria-label={`Category ${categoryLabel}`}>
                {categoryLabel}
              </div>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className={css.state} role="status" aria-live="polite">
            <p className={css.stateTitle}>Loading…</p>
            <p className={css.stateText}>Fetching notice details.</p>
          </div>
        ) : error ? (
          <div className={css.state} role="alert">
            <p className={css.stateTitle}>Couldn’t load notice</p>
            <p className={css.stateText}>Please try again.</p>
            <div className={css.stateActions}>
              <button type="button" className={css.primaryBtn} onClick={handleRetry}>
                Retry
              </button>
            </div>
          </div>
        ) : data ? (
          <>
            <div className={css.titleRow}>
              <h3 className={css.title}>{data.title}</h3>
              <div className={css.rating} aria-label={`Rating ${rating}`}>
                <div className={css.stars} aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={`star-${i}`}
                      className={i < rating ? css.starFilled : css.starEmpty}
                    />
                  ))}
                </div>
                <span className={css.ratingValue}>{rating}</span>
              </div>
            </div>

            <dl className={css.metaRow}>
              <div className={css.metaItem}>
                <dt className={css.metaLabel}>Name</dt>
                <dd className={css.metaValue}>{data.name}</dd>
              </div>
              <div className={css.metaItem}>
                <dt className={css.metaLabel}>Birthday</dt>
                <dd className={css.metaValue}>{data.birthday}</dd>
              </div>
              <div className={css.metaItem}>
                <dt className={css.metaLabel}>Sex</dt>
                <dd className={css.metaValue}>{capitalizeFirst(data.sex)}</dd>
              </div>
              <div className={css.metaItem}>
                <dt className={css.metaLabel}>Species</dt>
                <dd className={css.metaValue}>{capitalizeFirst(data.species)}</dd>
              </div>
            </dl>

            <p className={css.comment}>{data.comment}</p>

            <div className={css.bottomRow}>
              <div className={css.price} aria-label={data.price ? `Price $${data.price}` : 'No price'}>
                {typeof data.price === 'number' ? `$${data.price.toFixed(2)}` : ''}
              </div>

              <div className={css.actions}>
                <button
                  type="button"
                  className={css.primaryBtn}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={() => noticeId && onToggleFavorite(noticeId)}
                >
                  <span>{isFavorite ? 'Remove from' : 'Add to'}</span>
                  <Icon
                    id={isFavorite ? 'heart-filled' : 'heart'}
                    width={18}
                    height={18}
                  />
                </button>

                {data.user?.phone ? (
                  <a className={css.secondaryBtn} href={`tel:${data.user.phone}`}>
                    Contact
                  </a>
                ) : (
                  <button type="button" className={css.secondaryBtn} onClick={onClose}>
                    Contact
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={css.state} role="status" aria-live="polite">
            <p className={css.stateTitle}>No data</p>
            <p className={css.stateText}>Select a notice to view details.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

