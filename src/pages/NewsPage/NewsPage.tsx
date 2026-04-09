import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../../components/Pagination/Pagination';
import { SearchField } from '../../components/SearchField/SearchField';
import { Title } from '../../components/Title/Title';
import { NewsGrid } from '../../components/NewsGrid';
import type { NewsCardProps } from '../../components/NewsCard';
import { Loader } from '../../components/Loader';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNews } from '../../store/slices/newsSlice';
import type { NewsItem } from '../../types';
import { formatNewsDate } from '../../utils/formatNewsDate';
import css from './NewsPage.module.css';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const getFirstStringField = (obj: unknown, keys: string[]): string => {
  if (!isRecord(obj)) return '';
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'string' && val.trim()) return val;
  }
  return '';
};

const toCardItem = (n: NewsItem): NewsCardProps => {
  const excerpt =
    // Backend (confirmed) uses `text` as the short description.
    getFirstStringField(n, ['text', 'description', 'content', 'body', 'summary', 'excerpt']) ||
    '';

  return {
    imgUrl: n.imgUrl,
    title: n.title,
    excerpt,
    date: formatNewsDate(n.date),
    dateTime: n.date,
    url: n.url,
  };
};

export const NewsPage = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { items: newsItems, totalPages, isLoading, error } = useAppSelector((s) => s.news);

  const [searchParams, setSearchParams] = useSearchParams();

  const [draftQuery, setDraftQuery] = useState('');

  const keyword = searchParams.get('keyword') ?? '';
  const currentPage = useMemo(() => {
    const raw = searchParams.get('page');
    const n = raw ? Number(raw) : 1;
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }, [searchParams]);

  // Keep input field in sync with URL keyword on back/forward navigation.
  useEffect(() => {
    setDraftQuery(keyword);
  }, [keyword]);

  useEffect(() => {
    void dispatch(fetchNews({ page: currentPage, keyword, limit: 6 }));
  }, [dispatch, currentPage, keyword]);

  const cardItems = useMemo(() => newsItems.map(toCardItem), [newsItems]);

  return (
    <main className={css.page}>
      <Loader />
      <div className={css.container}>
        <div className={css.headerRow}>
          <Title text="News" className={css.title} />
          <div className={css.search}>
            <SearchField
              value={draftQuery}
              onChange={setDraftQuery}
              onSearch={(value) => {
                const next = new URLSearchParams(searchParams);
                const nextKeyword = value.trim();

                if (nextKeyword) next.set('keyword', nextKeyword);
                else next.delete('keyword');

                // Reset page on a new search; omit page=1 for clean URLs.
                next.delete('page');

                setSearchParams(next, { replace: true });
              }}
              placeholder="Search"
              label="Search news"
            />
          </div>
        </div>

        {error && (
          <section role="alert" aria-live="polite">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void dispatch(fetchNews({ page: currentPage, keyword, limit: 6 }))}
              disabled={isLoading}
            >
              Try again
            </button>
          </section>
        )}

        {!error && cardItems.length === 0 && !isLoading && (
          <section aria-live="polite">
            <p>No news found.</p>
          </section>
        )}

        {!error && cardItems.length > 0 && <NewsGrid items={cardItems} />}

        <div className={css.pagination}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              const next = new URLSearchParams(searchParams);
              if (page <= 1) next.delete('page');
              else next.set('page', String(page));
              setSearchParams(next, { replace: true });
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default NewsPage;
