import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { NoticesFilters } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  clearNoticesError,
  fetchNotices,
  fetchNoticesOptions,
  toggleFavorite,
} from '../../store/slices/noticesSlice';
import { markNoticeViewed } from '../../store/slices/viewedNoticesSlice';
import { Title } from '../../components/Title';
import { NoticesFilters as NoticesFiltersPanel, type NoticesSortKey } from '../../components/NoticesFilters';
import { NoticesList } from '../../components/NoticesList';
import { Pagination } from '../../components/Pagination';
import { NoticeModal } from '../../components/NoticeModal';
import { AuthPromptModal } from '../../components/AuthPromptModal';
import css from './NoticesPage.module.css';

// ── Sort key ↔ API params ─────────────────────────────────────────────────────
const SORT_MAP: Record<NonNullable<NoticesSortKey>, Pick<NoticesFilters, 'sortBy' | 'sortByOrder'>> = {
  popular:   { sortBy: 'popularity', sortByOrder: 'desc' },
  unpopular: { sortBy: 'popularity', sortByOrder: 'asc'  },
  cheap:     { sortBy: 'price',      sortByOrder: 'asc'  },
  expensive: { sortBy: 'price',      sortByOrder: 'desc' },
};

// Reverse map: "sortBy-sortByOrder" → sort key UI label
const URL_TO_SORT: Record<string, NoticesSortKey> = {
  'popularity-desc': 'popular',
  'popularity-asc':  'unpopular',
  'price-asc':       'cheap',
  'price-desc':      'expensive',
};

const ITEMS_PER_PAGE = 6;
const SEARCH_DEBOUNCE_MS = 1000;

// ── Filter state shape ────────────────────────────────────────────────────────
interface LocalFilters {
  search: string;
  category: string;
  gender: string;
  type: string;
  location: string;
  sort: NoticesSortKey;
}

// ── URL ↔ state helpers (module-level, pure) ──────────────────────────────────

/**
 * URLSearchParams → { filters, page }.
 * Called inside useMemo so the URL is the single source of truth.
 * Back / forward, hard-refresh, and shared links all work automatically.
 */
function parseFromUrl(sp: URLSearchParams): { filters: LocalFilters; page: number } {
  const sortBy      = sp.get('sortBy')      ?? '';
  const sortByOrder = sp.get('sortByOrder') ?? '';
  return {
    filters: {
      search:   sp.get('keyword')    ?? '',
      category: sp.get('category')   ?? '',
      gender:   sp.get('sex')        ?? '',
      type:     sp.get('species')    ?? '',
      location: sp.get('locationId') ?? '',
      sort:     URL_TO_SORT[`${sortBy}-${sortByOrder}`] ?? null,
    },
    page: Math.max(1, Number(sp.get('page') ?? 1)),
  };
}

/** { filters, page } → URLSearchParams — empty/default values are omitted. */
function toUrl(filters: LocalFilters, page: number): URLSearchParams {
  const sp = new URLSearchParams();
  if (filters.search)   sp.set('keyword',    filters.search);
  if (filters.category) sp.set('category',   filters.category);
  if (filters.gender)   sp.set('sex',        filters.gender);
  if (filters.type)     sp.set('species',    filters.type);
  if (filters.location) sp.set('locationId', filters.location);
  if (page > 1)         sp.set('page',       String(page));
  if (filters.sort) {
    const { sortBy, sortByOrder } = SORT_MAP[filters.sort];
    if (sortBy)      sp.set('sortBy',      sortBy);
    if (sortByOrder) sp.set('sortByOrder', sortByOrder);
  }
  return sp;
}

// ── Misc helpers ──────────────────────────────────────────────────────────────
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const toOptions  = (arr: string[]) => arr.map((v) => ({ value: v, label: capitalize(v) }));

// ─────────────────────────────────────────────────────────────────────────────

const NoticesPage = () => {
  const dispatch   = useAppDispatch();
  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);
  const currentUser = useAppSelector((s) => s.auth.user);
  const { items, error, totalPages, currentPage, favoriteIds, filterOptions, isLoading } =
    useAppSelector((s) => s.notices);

  const [searchParams, setSearchParams] = useSearchParams();
  const [openNoticeId, setOpenNoticeId] = useState<string | null>(null);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const lastErrorToastRef = useRef<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Derive filter state and page directly from the URL.
   * useSearchParams() returns a stable searchParams reference that only changes
   * when location.search changes, so useMemo recomputes only on real URL changes.
   * This makes the URL the single source of truth — no separate useState,
   * no sync effects, no loop-prevention refs needed.
   */
  const { filters: localFilters, page } = useMemo(
    () => parseFromUrl(searchParams),
    [searchParams],
  );

  // ── Load dropdown options once on mount ───────────────────────────────────
  useEffect(() => { void dispatch(fetchNoticesOptions()); }, [dispatch]);

  // ── Fetch notices whenever URL-derived filters or page change ─────────────
  useEffect(() => {
    const params: Partial<NoticesFilters> = {
      search:   localFilters.search   || undefined,
      category: localFilters.category || undefined,
      gender:   localFilters.gender   || undefined,
      type:     localFilters.type     || undefined,
      location: localFilters.location || undefined,
      page,
      limit: ITEMS_PER_PAGE,
      ...(localFilters.sort ? SORT_MAP[localFilters.sort] : {}),
    };
    void dispatch(fetchNotices(params));
  }, [dispatch, localFilters, page]);

  useEffect(() => {
    return () => {
      dispatch(clearNoticesError());
      lastErrorToastRef.current = null;
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, [dispatch]);

  // ── Surface API errors ────────────────────────────────────────────────────
  useEffect(() => {
    if (!error || error === lastErrorToastRef.current) return;
    lastErrorToastRef.current = error;
    toast.error(error, { toastId: `notices-error-${error}` });
  }, [error]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const applyFilterParams = useCallback(
    (nextFilters: LocalFilters, replace: boolean) => {
      const nextUrl = toUrl(nextFilters, 1);
      setSearchParams((current) => {
        if (nextUrl.toString() === current.toString()) return current;
        return nextUrl;
      }, { replace });
    },
    [setSearchParams],
  );

  // Filter changes replace the current history entry (no keystroke history spam)
  const handleFiltersChange = useCallback(
    (patch: Partial<LocalFilters>) => {
      const nextFilters = { ...localFilters, ...patch };
      const isSearchOnlyPatch = Object.keys(patch).length === 1 && 'search' in patch;

      if (isSearchOnlyPatch) {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
          applyFilterParams(nextFilters, true);
          searchDebounceRef.current = null;
        }, SEARCH_DEBOUNCE_MS);
        return;
      }

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      applyFilterParams(nextFilters, true);
    },
    [applyFilterParams, localFilters],
  );

  // Page changes push a new history entry so back / forward works per page
  const retryFetchNotices = useCallback(() => {
    const params: Partial<NoticesFilters> = {
      search:   localFilters.search   || undefined,
      category: localFilters.category || undefined,
      gender:   localFilters.gender   || undefined,
      type:     localFilters.type     || undefined,
      location: localFilters.location || undefined,
      page,
      limit: ITEMS_PER_PAGE,
      ...(localFilters.sort ? SORT_MAP[localFilters.sort] : {}),
    };
    void dispatch(fetchNotices(params));
  }, [dispatch, localFilters, page]);

  const handlePageChange = useCallback(
    (p: number) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      const nextUrl = toUrl(localFilters, p);
      setSearchParams((current) => {
        if (nextUrl.toString() === current.toString()) return current;
        return nextUrl;
      }, { replace: false });
    },
    [localFilters, setSearchParams],
  );

  // favoriteIds is already a string[] from Redux; wrap in a Set for O(1) lookup
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      if (!isLoggedIn) { setIsAuthPromptOpen(true); return; }
      void dispatch(toggleFavorite({ id, isFavorite: favoriteIdSet.has(id) }));
    },
    [dispatch, isLoggedIn, favoriteIdSet],
  );

  const handleLearnMore = useCallback((id: string) => {
    if (!isLoggedIn) { setIsAuthPromptOpen(true); return; }
    const userKey = currentUser?._id ?? currentUser?.email;
    if (userKey) {
      const selectedNotice = items.find((notice) => notice._id === id);
      dispatch(markNoticeViewed({ userKey, noticeId: id, notice: selectedNotice }));
    }
    setOpenNoticeId(id);
  }, [currentUser?._id, currentUser?.email, dispatch, isLoggedIn, items]);

  const handleCloseModal = useCallback(() => {
    setOpenNoticeId(null);
  }, []);

  return (
    <div className={css.page}>
      <div className={css.titleWrap}>
        <Title text="Find your favorite pet" className={css.title} />
      </div>

      <NoticesFiltersPanel
        values={localFilters}
        onChange={handleFiltersChange}
        categoryOptions={toOptions(filterOptions.categories)}
        genderOptions={toOptions(filterOptions.sexOptions)}
        typeOptions={toOptions(filterOptions.speciesOptions)}
      />

      {items.length > 0 ? (
        <>
          <NoticesList
            items={items}
            getIsFavorite={(id) => favoriteIdSet.has(id)}
            onToggleFavorite={handleToggleFavorite}
            onLearnMore={handleLearnMore}
          />

          <div className={css.paginationWrap}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className={css.empty} role="status" aria-live="polite">
          <div className={css.emptyCard}>
            {error ? (
              <>
                <p className={css.emptyTitle}>{error}</p>
                <p className={css.emptyText}>Check your connection and try again.</p>
                <button
                  type="button"
                  className="pl-btn pl-btn--primary"
                  onClick={() => retryFetchNotices()}
                  disabled={isLoading}
                >
                  Try again
                </button>
              </>
            ) : (
              <>
                <p className={css.emptyTitle}>No notices found</p>
                <p className={css.emptyText}>Try adjusting your search or filters.</p>
              </>
            )}
          </div>
        </div>
      )}

      <NoticeModal
        isOpen={openNoticeId !== null}
        noticeId={openNoticeId}
        isFavorite={openNoticeId ? favoriteIdSet.has(openNoticeId) : false}
        onToggleFavorite={handleToggleFavorite}
        onClose={handleCloseModal}
      />

      <AuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
      />
    </div>
  );
};

export default NoticesPage;

