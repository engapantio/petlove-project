import { NewsCard, type NewsCardProps } from '../NewsCard';
import css from './NewsGrid.module.css';

interface NewsGridProps {
  items: NewsCardProps[];
  className?: string;
}

export const NewsGrid = ({ items, className = '' }: NewsGridProps): React.ReactElement => {
  return (
    <ul className={`${css.grid} ${className}`.trim()}>
      {items.map((item) => (
        <li key={item.url} className={css.item}>
          <NewsCard {...item} />
        </li>
      ))}
    </ul>
  );
};
