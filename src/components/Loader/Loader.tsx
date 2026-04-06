import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../hooks/redux';
import styles from './Loader.module.css';

// ── SVG geometry ──────────────────────────────────────────────────────────────
const RADIUS      = 46;                          // circle radius
const STROKE      = 6;                           // stroke width
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;      // ~289px full circle

interface LoaderProps {
  /**
   * Optional explicit progress (0–100).
   * When omitted the component reads from Redux auth.isLoading and
   * auto-animates 0 → 100 over 1.5 s so the user always sees motion.
   */
  progress?: number;
}

export const Loader = ({ progress }: LoaderProps): React.ReactElement | null => {
  // ── Read loading flag from every relevant slice ────────────────────────────
  const authLoading  = useAppSelector((s) => s.auth.isLoading);
  const isRefreshing = useAppSelector((s) => s.auth.isRefreshing);
  // const noticesLoading = useAppSelector((s) => s.notices.isLoading);

  const isVisible = authLoading || isRefreshing; // || noticesLoading

  // ── Auto-animate counter when no real progress is supplied ────────────────
  const counterRef = useRef<HTMLSpanElement>(null);
  const rafRef     = useRef<number>(0);
  const startRef   = useRef<number>(0);
  const DURATION   = 1_500; // ms

  useEffect(() => {
    if (!isVisible || progress !== undefined) return;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct     = Math.min(Math.round((elapsed / DURATION) * 100), 100);

      if (counterRef.current) counterRef.current.textContent = `${pct}%`;

      // update SVG offset directly (avoids React re-renders in the hot path)
      const circle = document.getElementById('loader-progress-circle') as SVGCircleElement | null;
      if (circle) {
        const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
        circle.style.strokeDashoffset = String(offset);
      }

      if (pct < 100) rafRef.current = requestAnimationFrame(animate);
    };

    startRef.current = 0;
    rafRef.current   = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isVisible, progress]);

  if (!isVisible) return null;

  // ── When a real progress value is provided ────────────────────────────────
  const pct    = progress !== undefined ? Math.max(0, Math.min(100, progress)) : 0;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <div
      className={styles.backdrop}
      role="status"
      aria-label={`Loading, ${progress !== undefined ? pct : 0}%`}
      aria-live="polite"
    >
      <div className={styles.card}>
        <svg
          className={styles.svg}
          viewBox="0 0 100 100"
          width="120"
          height="120"
          aria-hidden="true"
        >
          {/* Track ring */}
          <circle
            className={styles.track}
            cx="50"
            cy="50"
            r={RADIUS}
            strokeWidth={STROKE}
          />
          {/* Progress ring */}
          <circle
            id="loader-progress-circle"
            className={styles.progress}
            cx="50"
            cy="50"
            r={RADIUS}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={progress !== undefined ? offset : CIRCUMFERENCE}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>

        {/* Percentage label — positioned over the SVG centre */}
        <span
          ref={counterRef}
          className={styles.counter}
          aria-live="off"
        >
          {progress !== undefined ? `${pct}%` : '0%'}
        </span>
      </div>
    </div>
  );
};
