import styles from './Title.module.css';

interface TitleProps {
  text: string;
  /** Optional extra class for per-page overrides */
  className?: string;
}

export const Title = ({ text, className = '' }: TitleProps): React.ReactElement => (
  <h1 className={`${styles.title} ${className}`.trim()}>{text}</h1>
);
