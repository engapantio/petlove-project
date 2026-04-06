# Petlove — Implementation Brief

> **Project:** Petlove (GoIT Frontend Project #2)
> **Figma:** https://www.figma.com/file/puMNfZVg4YI8UZoJ1QiLLi/Petl%F0%9F%92%9Bve
> **Backend / Swagger:** https://petlove.b.goit.study/api-docs/
> **Stack:** React 18 + TypeScript + Vite + React Router v6 + Redux Toolkit + react-hook-form + Yup + react-select + react-toastify

---

## 1. General Technical Requirements

| Area | Requirement |
|---|---|
| Responsive | mobile: 320px fluid → 375px adaptive; tablet: 768px; desktop: 1280px |
| Semantics | Full HTML5 semantic markup; valid HTML |
| Fonts | Connected via CDN (Google Fonts or Fontshare) |
| Images | Optimised raster + vector; retina (@2x) support; lazy loading |
| Icons | ALL icons via a single SVG sprite (no inline icons, no icon-font) |
| Favicon | Present on all pages |
| Console | Zero console errors in production build |
| Routing | React Router v6 (`<BrowserRouter>` + `<Routes>`) |
| Forms | `react-hook-form` + `Yup` (TZ component specs override the general criterion of Formik) |
| State | Redux Toolkit (auth slice + notices slice + pets slice) |
| Deploy | Netlify / Vercel / any static host |
| Repo | README.md: project description, tech stack, Figma link, backend link |

---

## 2. Route Map

| Path | Type | Auth | Redirects |
|---|---|---|---|
| `/` | Layout wrapper | — | — |
| `/home` | Public unrestricted | — | — |
| `/news` | Public unrestricted | — | — |
| `/notices` | Public unrestricted | — | — |
| `/friends` | Public unrestricted | — | — |
| `/register` | Public restricted | Guest only | → `/profile` if logged in |
| `/login` | Public restricted | Guest only | → `/profile` if logged in |
| `/profile` | Private | Auth required | → `/login` if not logged in |
| `/add-pet` | Private | Auth required | → `/login` if not logged in |

Create `<PrivateRoute>` and `<RestrictedRoute>` wrapper components.

---

## 3. Component Tree

### 3.1 Main Layout (`/`)
```
App
└── MainLayout
    ├── Header
    │   ├── Logo               → links to /home
    │   ├── Nav                → /news, /notices, /friends (burger on mobile/tablet)
    │   ├── AuthNav            → /register, /login  (guests only; burger on mobile)
    │   └── UserNav            → (auth users only; burger on mobile)
    │       ├── UserBar        → avatar + name → /profile
    │       └── LogOutBtn      → opens ModalApproveAction
    └── Loader                 (global, shown during any pending API call)
```

**Header behaviour:**
- Active nav link must be visually highlighted.
- On mobile/tablet: `Nav`, `AuthNav`, `UserNav` collapse into a burger menu.

### 3.2 Home Page (`/home`)
```
HomePage
├── Hero heading + description text
└── Static hero image
```

### 3.3 News Page (`/news`)
```
NewsPage
├── Title              (reusable)
├── SearchField        (reusable)
├── NewsList
│   └── NewsItem × N
└── Pagination         (reusable)
```

**NewsItem fields:** image, title, short description, publication date, "Read more" link (opens in new tab).

**SearchField behaviour:**
- Show ✕ clear button only when input has value.
- Search fires on `submit` or click of 🔍 icon.

**Pagination behaviour:**
- Always render: `<<` `<` [page numbers] `>` `>>`
- Show `...` when page count is high.
- Hide entirely when only 1 page.
- `<<` / `<` disabled on first page; `>` / `>>` disabled on last page.
- `...` is visual-only (no click handler).
- Server-side: pass `page` + `limit` as query params.

### 3.4 Notices Page (`/notices`)
```
NoticesPage
├── Title              (reusable)
├── NoticesFilters
│   ├── SearchField    (reusable)
│   ├── Select: category      (options from API)
│   ├── Select: sex           (options from API)
│   ├── Select: species       (options from API)
│   ├── Select: location      (react-select with async search)
│   ├── Radio: sort by popularity / price
│   └── Button: Reset         (clears all filters to defaults)
├── NoticesList
│   └── NoticesItem × N
└── Pagination         (reusable)
```

**NoticesFilters:** re-fetch notices on every filter/pagination change (no manual "Search" button).

**NoticesItem fields:** image, title, popularity score, pet name, birthday, sex, species, category, comment.
**NoticesItem buttons:**
- "Learn more" + heart icon:
  - **Guest** → opens `ModalAttention`
  - **Auth user** → "Learn more" fetches detail + opens `ModalNotice`; heart toggles favourite (add/remove API call), icon reflects current state.

**ModalAttention** (guests only):
- Warning text + links to `/register` and `/login`.
- Closes: ✕ button / backdrop click / Escape.

**ModalNotice** (auth users):
- Full notice detail: image, title, popularity, pet info, comment.
- "Add to / Remove from" button → API toggle + live state update.
- "Contact" button → `tel:` or `mailto:` protocol link.
- Closes: ✕ button / backdrop click / Escape.

### 3.5 Our Friends Page (`/friends`)
```
FriendsPage
├── Title              (reusable)
└── FriendsList
    └── FriendsItem × N
```

**FriendsItem fields:** logo, company name, address (links → Google Maps, new tab), email (`mailto:`), phone (`tel:`).
All contact links have `:hover` effect.

### 3.6 Registration Page (`/register`)
```
RegisterPage
├── PetBlock           (reusable static image)
├── Title              (reusable)
├── RegistrationForm
│   ├── Input: name
│   ├── Input: email
│   ├── Input: password       (toggle visibility)
│   ├── Input: confirmPassword (toggle visibility)
│   └── Button: "Registration" (type="submit")
└── Link → /login
```

### 3.7 Login Page (`/login`)
```
LoginPage
├── PetBlock           (reusable static image)
├── Title              (reusable)
├── LoginForm
│   ├── Input: email
│   ├── Input: password       (toggle visibility)
│   └── Button: "Log In" (type="submit")
└── Link → /register
```

### 3.8 Profile Page (`/profile`)
```
ProfilePage
├── UserCard
│   ├── EditUserBtn            → opens ModalEditUser
│   ├── UserBlock
│   │   ├── Avatar (or EditUserBtn placeholder when no avatar)
│   │   ├── Name
│   │   ├── Email
│   │   └── Phone
│   ├── PetsBlock
│   │   ├── AddPet             → /add-pet
│   │   └── PetsList
│   │       └── PetsItem × N   (image, title, name, birthday, sex, type, 🗑 delete btn)
│   └── LogOutBtn              → ModalApproveAction
└── MyNotices
    ├── Tab: "My favorites pets" (default active)
    ├── Tab: "Viewed"
    └── NoticesItem × N        (favourites tab also shows 🗑 remove-from-favourites btn)
```

**PetsItem delete:** DELETE API → remove card from list without page reload.
**MyNotices favourites 🗑:** DELETE API → remove item from list without page reload.

### 3.9 Add Pet Page (`/add-pet`)
```
AddPetPage
├── PetBlock           (reusable static image)
└── AddPetForm
    ├── Radio: sex (male / female)
    ├── Input: imgUrl
    ├── Input: title
    ├── Input: name
    ├── Input: birthday
    ├── Select/Input: species (type)
    ├── Button: "Submit" (type="submit")
    └── Button: "Back"  (type="button") → /profile, no save
```

---

## 4. Reusable Components

| Component | Used in |
|---|---|
| `Title` | News, Notices, Friends, Register, Login |
| `SearchField` | News, NoticesFilters |
| `Pagination` | News, Notices |
| `PetBlock` | Register, Login, AddPet |
| `Loader` | Global (MainLayout) |
| `NoticesItem` | NoticesList, MyNotices |
| `ModalApproveAction` | LogOutBtn (Header + Profile) |

---

## 5. Form Validation Rules (react-hook-form + Yup)

### RegistrationForm
```ts
const schema = yup.object({
  name:            yup.string().required('Name is required'),
  email:           yup.string()
                      .matches(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Invalid email')
                      .required('Email is required'),
  password:        yup.string().min(7, 'Min 7 characters').required('Password is required'),
  confirmPassword: yup.string()
                      .oneOf([yup.ref('password')], 'Passwords must match')
                      .required('Please confirm your password'),
});
```

### LoginForm
```ts
const schema = yup.object({
  email:    yup.string()
               .matches(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Invalid email')
               .required('Email is required'),
  password: yup.string().min(7, 'Min 7 characters').required('Password is required'),
});
```

### ModalEditUser
```ts
const schema = yup.object({
  name:   yup.string(),
  email:  yup.string().matches(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Invalid email'),
  avatar: yup.string().matches(/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp)$/, 'Invalid image URL'),
  phone:  yup.string().matches(/^\+38\d{10}$/, 'Format: +38XXXXXXXXXX'),
});
```

### AddPetForm
```ts
const schema = yup.object({
  title:    yup.string().required(),
  name:     yup.string().required(),
  imgUrl:   yup.string()
               .matches(/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp)$/, 'Invalid image URL')
               .required(),
  species:  yup.string().required(),
  birthday: yup.string()
               .matches(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD')
               .required(),
  sex:      yup.string().required(),
});
```

---

## 6. Auth Flow

1. **Register:** POST `/users/register` → on success, auto-login (token stored in `localStorage` + Redux) → redirect `/profile`.
2. **Login:** POST `/users/login` → same as above.
3. **Logout:** POST `/users/logout` → regardless of response, clear Redux store + `localStorage` → redirect `/home`.
4. **Persist session:** On app mount, read token from `localStorage` → dispatch `refreshUser` thunk → GET `/users/current`.
5. **Axios interceptor:** Attach `Authorization: Bearer <token>` to all private requests.

---

## 7. Redux Store Shape

```ts
interface RootState {
  auth: {
    user: { name: string; email: string; avatar: string | null; phone: string | null } | null;
    token: string | null;
    isLoggedIn: boolean;
    isRefreshing: boolean;
  };
  notices: {
    items: Notice[];
    total: number;
    currentPage: number;
    filters: NoticesFilters;
    isLoading: boolean;
    error: string | null;
  };
  news: {
    items: NewsArticle[];
    total: number;
    currentPage: number;
    keyword: string;
    isLoading: boolean;
  };
  pets: {
    items: Pet[];
    isLoading: boolean;
  };
}
```

---

## 8. Modal Behaviour (all modals)

Close triggers:
- Click ✕ button
- Click backdrop (outside modal content)
- Press `Escape` key

Implementation pattern:
```ts
useEffect(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [onClose]);
```
Use `ReactDOM.createPortal` to render modals into `document.body`.

---

## 9. Notifications (Toast)

Use `react-toastify`. Show toast for:
- API errors (all forms, logout, favourite toggle, pet delete)
- Successful operations (optional, improves UX)

```tsx
import { toast } from 'react-toastify';
// In catch block:
toast.error(error.response?.data?.message ?? 'Something went wrong');
```

---

## 10. Folder Structure

```
src/
├── api/              # axios instance + all API functions
├── assets/
│   ├── icons/        # SVG sprite source files
│   └── images/       # static images (PetBlock, Home hero)
├── components/       # reusable components
│   ├── Header/
│   ├── Loader/
│   ├── Modal/        # base modal wrapper
│   ├── ModalApproveAction/
│   ├── ModalAttention/
│   ├── ModalEditUser/
│   ├── ModalNotice/
│   ├── Pagination/
│   ├── PetBlock/
│   ├── SearchField/
│   └── Title/
├── hooks/            # useModal, useAuth, useDebounce, etc.
├── pages/
│   ├── HomePage/
│   ├── NewsPage/
│   ├── NoticesPage/
│   ├── FriendsPage/
│   ├── RegisterPage/
│   ├── LoginPage/
│   ├── ProfilePage/
│   └── AddPetPage/
├── redux/
│   ├── auth/         # slice + thunks
│   ├── notices/
│   ├── news/
│   └── pets/
├── routes/
│   ├── PrivateRoute.tsx
│   └── RestrictedRoute.tsx
├── types/            # TypeScript interfaces
└── utils/            # formatDate, buildQueryString, etc.
```

---

## 11. README.md Template

```markdown
# Petlove

A pet adoption and news aggregator web application built as part of GoIT Frontend bootcamp.

## About
Users can browse pet adoption notices, filter by category/sex/species/location,
manage favourites, add their own pets, and read news — all within a responsive, accessible UI.

## Technologies
- React 18 + TypeScript
- Vite
- React Router v6
- Redux Toolkit
- react-hook-form + Yup
- react-select
- react-toastify
- axios

## Links
- **Figma:** https://www.figma.com/file/puMNfZVg4YI8UZoJ1QiLLi/Petl%F0%9F%92%9Bve
- **Backend API:** https://petlove.b.goit.study/api-docs/
- **Live demo:** [your deployed URL]
```

---

## 12. QA Checklist

- [ ] Zero console errors/warnings in production build
- [ ] All 9 routes render correctly
- [ ] Auth guard: private routes redirect unauthenticated users
- [ ] Restricted routes redirect authenticated users
- [ ] Session persists on page refresh (refreshUser thunk)
- [ ] All 4 forms validate inline before submission
- [ ] Toast shown on every API error
- [ ] All modals close on ✕, backdrop, Escape
- [ ] Pagination hides when totalPages === 1
- [ ] Notices re-fetch on every filter change
- [ ] Pet/notice deleted without page reload
- [ ] Favourite icon reflects real-time state
- [ ] SVG sprite used for all icons (no inline SVGs in component JSX)
- [ ] Retina images: `srcSet` with 2x versions
- [ ] Responsive: tested at 375px, 768px, 1280px
- [ ] Burger menu works on mobile/tablet
- [ ] Active nav link highlighted
- [ ] Loader shown during all pending requests
- [ ] README.md present with all required sections
- [ ] Project deployed and live URL in README
