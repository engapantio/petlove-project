import type { NoticeCardItem } from '../../types';
import { NoticeCard } from '../NoticeCard';
import css from './NoticesList.module.css';

interface NoticesListProps {
  items: NoticeCardItem[];
  getIsFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
  onLearnMore?: (id: string) => void;
  fallbackImageSrc?: string;
}

export const NoticesList = ({
  items,
  getIsFavorite,
  onToggleFavorite,
  onLearnMore,
  fallbackImageSrc,
}: NoticesListProps): React.ReactElement => {
  return (
    <section className={css.section} aria-label="Notices">
      <div className={css.grid} role="list">
        {items.map((item) => (
          <div key={item._id} role="listitem" className={css.cell}>
            <NoticeCard
              item={item}
              isFavorite={getIsFavorite?.(item._id) ?? false}
              onToggleFavorite={onToggleFavorite}
              onLearnMore={onLearnMore}
              fallbackImageSrc={fallbackImageSrc}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

