import { useEffect, useId, useRef } from 'react';
import type { ReactElement } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { MainStyleBackground } from '../MainStyleBackground';
import styles from './Loader.module.css';

/** Progress ring in viewBox space (427×427 — scales with cluster 292 / 427). */
const VB = 427;
const CX = VB / 2;
const CY = VB / 2;
const R = 196;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface LoaderProps {
  /**
   * Optional explicit progress (0–100).
   * When omitted the component auto-animates 0 → 100 over 1.5 s (Redux visibility or route fallback).
   */
  progress?: number;
  /** Suspense fallback: ignore Redux and always show the Main-style loading shell. */
  forceRouteFallback?: boolean;
}

export const Loader = ({
  progress,
  forceRouteFallback = false,
}: LoaderProps): ReactElement | null => {
  const authLoading = useAppSelector((s) => s.auth.isLoading);
  const isRefreshing = useAppSelector((s) => s.auth.isRefreshing);
  const noticesLoading = useAppSelector((s) => s.notices.isLoading);
  const newsLoading = useAppSelector((s) => s.news.isLoading);
  const friendsLoading = useAppSelector((s) => s.friends.isLoading);

  const isVisible =
    forceRouteFallback ||
    authLoading ||
    isRefreshing ||
    noticesLoading ||
    newsLoading ||
    friendsLoading;

  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const DURATION = 1_500;

  const rawId = useId();
  const gradId = `loader-grad-${rawId.replace(/:/g, '')}`;

  useEffect(() => {
    if (!isVisible || progress !== undefined) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      if (counterRef.current) counterRef.current.textContent = '100%';
      if (progressRef.current) progressRef.current.style.strokeDashoffset = '0';
      return;
    }

    let lastLabelPct = -1;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min(Math.round((elapsed / DURATION) * 100), 100);
      const labelPct = pct >= 100 ? 100 : Math.floor(pct / 5) * 5;
      if (labelPct !== lastLabelPct && counterRef.current) {
        counterRef.current.textContent = `${labelPct}%`;
        lastLabelPct = labelPct;
      }

      const circle = progressRef.current;
      if (circle) {
        const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
        circle.style.strokeDashoffset = String(offset);
      }

      if (pct < 100) rafRef.current = requestAnimationFrame(animate);
    };

    startRef.current = 0;
    if (counterRef.current) counterRef.current.textContent = '0%';
    if (progressRef.current)
      progressRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isVisible, progress]);

  if (!isVisible) return null;

  const pct = progress !== undefined ? Math.max(0, Math.min(100, progress)) : 0;
  const dashOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <div
      className={styles.shell}
      role="status"
      aria-busy="true"
      aria-label={
        progress !== undefined
          ? `Loading, ${pct}%`
          : 'Loading'
      }
      aria-live="polite"
    >
      <MainStyleBackground className={styles.loaderMainBg} heroFetchPriority="low">
        <div className={styles.loaderCluster}>
          <div className={styles.clusterInner}>
            <svg
              className={styles.svgRing}
              viewBox={`0 0 ${VB} ${VB}`}
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id={gradId}
                  gradientUnits="userSpaceOnUse"
                  x1={CX - 180}
                  y1={CY - 180}
                  x2={CX + 180}
                  y2={CY + 180}
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              {/* Figma weight 2; only the arc is drawn — invisible at 0%, grows with dash offset. */}
              <circle
                ref={progressRef}
                className={styles.progress}
                cx={CX}
                cy={CY}
                r={R}
                stroke={`url(#${gradId})`}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={
                  progress !== undefined ? dashOffset : CIRCUMFERENCE
                }
                transform={`rotate(-90 ${CX} ${CY})`}
              />
            </svg>
            <span ref={counterRef} className={styles.counter} aria-live="off">
              {progress !== undefined ? `${pct}%` : '0%'}
            </span>
          </div>
        </div>
      </MainStyleBackground>
    </div>
  );
};

/** Full-bleed Main-style shell for React Suspense while lazy routes load. */
export function RouteLoaderFallback(): ReactElement {
  return <Loader forceRouteFallback />;
}
