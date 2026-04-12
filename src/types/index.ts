// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  token: string;
  /** Favorite notice objects returned by GET /users/current */
  noticesFavorites?: Array<{ _id: string }>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isRefreshing: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// ─── Pets / Notices ──────────────────────────────────────────────────────────
export interface Pet {
  _id: string;
  title: string;
  name: string;
  imgURL: string;
  species: string;
  birthday: string;
  sex: 'male' | 'female' | 'unknown';
  category: 'sell' | 'lost' | 'found' | 'free';
  price?: number;
  comment: string;
  popularity: number;
  owner?: string;
  createdAt?: string;
}

export interface NoticeDetails {
  _id: string;
  species: string;
  category: string;
  title: string;
  name: string;
  birthday: string;
  comment: string;
  sex: string;
  popularity?: number;
  price?: number;
  imgURL?: string;
  imgUrl?: string;
  location?: {
    _id: string;
    stateEn?: string;
    cityEn?: string;
  };
  user?: {
    _id: string;
    email?: string;
    phone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  totalPages: number;
  page: number;
  perPage: number;
}

export interface NoticesState {
  items: Pet[];
  /** IDs of the current user's favourite notices (string[] matches API response shape). */
  favoriteIds: string[];
  owned: Pet[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  filters: NoticesFilters;
  filterOptions: NoticesFilterOptions;
}

export interface NoticesFilters {
  search: string;
  category: string;
  gender: string;
  type: string;
  location: string;
  page: number;
  // API query extras (mapped to correct param names inside fetchNotices)
  limit?: number;
  sortBy?: string;
  sortByOrder?: 'asc' | 'desc';
}

export interface NoticesFilterOptions {
  categories: string[];
  sexOptions: string[];
  speciesOptions: string[];
}

// ─── Notices UI (minimal, for NoticeCard / NoticesList) ────────────────────────
export type NoticeSex = 'male' | 'female' | 'unknown';
export type NoticeCategory = 'sell' | 'lost' | 'found' | 'free';

export interface NoticeCardItem {
  _id: string;
  title: string;
  name: string;
  imgURL?: string;
  species: string;
  birthday: string;
  sex: NoticeSex;
  category: NoticeCategory;
  comment: string;
  popularity?: number;
  price?: number;
}

// ─── News ────────────────────────────────────────────────────────────────────
export interface NewsItem {
  _id: string;
  title: string;
  url: string;
  description: string;
  date: string;
  imgUrl?: string;
  id: string;
}

export interface NewsState {
  items: NewsItem[];
  totalPages: number;
  currentPage: number;
  search: string;
  isLoading: boolean;
  error: string | null;
}

// ─── Friends ─────────────────────────────────────────────────────────────────
export interface Friend {
  _id: string;
  title: string;
  /** Partner site; may be null from API */
  url: string | null;
  addressUrl: string | null;
  imageUrl: string;
  address: string | null;
  workDays: WorkDay[] | null;
  phone: string | null;
  email: string | null;
}

export interface WorkDay {
  isOpen: boolean;
  from: string;
  to: string;
}

export interface FriendsState {
  items: Friend[];
  isLoading: boolean;
  error: string | null;
}

// ─── Profile / My Pets ───────────────────────────────────────────────────────
export interface MyPet {
  _id: string;
  name: string;
  birthday: string;
  sex: string;
  species: string;
  imgURL?: string;
}

export interface ProfileState {
  pets: MyPet[];
  isLoading: boolean;
  error: string | null;
}
