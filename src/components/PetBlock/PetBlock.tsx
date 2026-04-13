import styles from './PetBlock.module.css';

interface PetBlockProps {
  src: string;
  alt: string;
  /** Optional extra class for page-specific sizing */
  className?: string;
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;
  sources?: Array<{
    media: string;
    srcSet: string;
    type?: string;
  }>;
}

export const PetBlock = ({
  src,
  alt,
  className = '',
  width = 592,
  height = 648,
  srcSet,
  sizes,
  sources = [],
}: PetBlockProps): React.ReactElement => (
  <div className={`${styles.block} ${className}`.trim()}>
    <picture>
      {sources.map((source) => (
        <source
          key={`${source.media}-${source.srcSet}`}
          media={source.media}
          srcSet={source.srcSet}
          type={source.type}
        />
      ))}
      <img
        src={src}
        alt={alt}
        className={styles.image}
        width={width}
        height={height}
        srcSet={srcSet}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </picture>
  </div>
);
