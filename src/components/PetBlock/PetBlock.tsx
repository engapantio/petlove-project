import styles from './PetBlock.module.css';

interface PetBlockProps {
  src: string;
  alt: string;
  /** Optional extra class for page-specific sizing */
  className?: string;
}

export const PetBlock = ({ src, alt, className = '' }: PetBlockProps): React.ReactElement => (
  <div className={`${styles.block} ${className}`.trim()}>
    <img
      src={src}
      alt={alt}
      className={styles.image}
      width={592}
      height={648}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  </div>
);
