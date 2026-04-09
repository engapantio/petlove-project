import { useId, useMemo, useState } from 'react';
import css from './NewsCard.module.css';

export interface NewsCardProps {
  imgUrl?: string;
  title: string;
  excerpt: string;
  date: string;
  /** ISO-like datetime for machine-readable <time dateTime>. */
  dateTime?: string;
  url: string;
  className?: string;
}

export const NewsCard = ({
  imgUrl,
  title,
  excerpt,
  date,
  dateTime,
  url,
  className = '',
}: NewsCardProps): React.ReactElement => {
  const [isImgBroken, setIsImgBroken] = useState(false);
  const titleId = useId();
  const excerptId = useId();

  const showImage = Boolean(imgUrl) && !isImgBroken;

  const readMoreLabel = useMemo(() => {
    const trimmed = title.trim();
    return trimmed.length > 0 ? `Read more: ${trimmed}` : 'Read more';
  }, [title]);

  return (
    <article
      className={`${css.card} ${className}`.trim()}
      aria-labelledby={titleId}
      aria-describedby={excerptId}
    >
      <div className={css.media}>
        {showImage ? (
          <img
            src={imgUrl}
            alt={title}
            className={css.image}
            width={361}
            height={226}
            loading="lazy"
            onError={() => setIsImgBroken(true)}
          />
        ) : (
          <div className={css.fallback} role="img" aria-label="News image placeholder" />
        )}
      </div>

      <div className={css.content}>
        <h2 id={titleId} className={css.title}>
          {title}
        </h2>
        <p id={excerptId} className={css.excerpt}>
          {excerpt}
        </p>

        <div className={css.metaRow}>
          <time className={css.date} dateTime={dateTime ?? date}>
            {date}
          </time>
          <a
            className={css.readMore}
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label={readMoreLabel}
          >
            Read more
          </a>
        </div>
      </div>
    </article>
  );
};
