// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  token: string;
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

export interface PaginatedResponse<T> {
  results: T[];
  totalPages: number;
  page: number;
  perPage: number;
}

export interface NoticesState {
  items: Pet[];
  favorites: Pet[];
  owned: Pet[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  filters: NoticesFilters;
}

export interface NoticesFilters {
  search: string;
  category: string;
  gender: string;
  type: string;
  location: string;
  page: number;
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
  url: string;
  addressUrl: string;
  imageUrl: string;
  address: string;
  workDays: WorkDay[];
  phone: string;
  email: string;
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
