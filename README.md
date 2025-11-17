# SISFO BAITULILMI - Next.js

Modern attendance tracking system built with Next.js 15, Firebase, and TypeScript.

## Features

- **Server-Side Rendering (SSR)** for better performance and SEO
- **Real-time Updates** with Firebase Firestore
- **Server Actions** for simplified form handling
- **Authentication Middleware** for protected routes
- **Type-safe** with TypeScript throughout
- **Responsive Design** with modern CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.8
- **Backend**: Firebase (Client SDK + Admin SDK)
- **Styling**: CSS with CSS Variables
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- Firebase service account credentials

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:

Create a `.env.local` file in the root directory:

```env
# Firebase Client SDK (Browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

### Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Copy the values to your `.env.local` file

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
SISFO-BAITULILMI/
├── app/                          # Next.js App Router
│   ├── admin/                   # Admin pages (protected)
│   ├── login/                   # Login page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Public attendance page (home)
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── attendance/              # Attendance-specific components
│   │   ├── CategoryStatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── AttendanceCheckmark.tsx
│   │   ├── PublicAttendanceModal.tsx
│   │   └── PublicAttendanceClient.tsx
│   └── common/                  # Shared components
│       └── LoadingSpinner.tsx
│
├── lib/                         # Utilities & services
│   ├── firebase/               # Firebase configuration
│   │   ├── client.ts           # Firebase Client SDK
│   │   ├── admin.ts            # Firebase Admin SDK
│   │   └── auth-helpers.ts     # Auth utility functions
│   ├── actions/                # Server Actions
│   │   ├── attendance.ts       # Attendance CRUD operations
│   │   ├── categories.ts       # Category/user management
│   │   └── auth.ts             # Authentication actions
│   ├── hooks/                  # Custom React hooks
│   │   └── useAnimatedCount.ts
│   ├── utils/                  # Utility functions
│   │   └── date.ts
│   └── constants.ts            # App constants
│
├── types/                       # TypeScript type definitions
│   └── index.ts
│
├── middleware.ts                # Next.js middleware (auth protection)
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## Key Improvements from React Version

### 1. Server Components
- Public page uses Server Components for initial data fetching
- Better performance and SEO
- Reduced client-side JavaScript

### 2. Server Actions
- Simplified form handling without API routes
- Type-safe server-side mutations
- Automatic revalidation with `revalidatePath()`

### 3. Middleware
- Route protection at the edge
- Cleaner than React Router's `PrivateRoute`
- Automatic redirects for auth

### 4. Firebase Admin SDK
- Secure server-side operations
- Session cookies for authentication
- Better security than client-only auth

### 5. Real-time Updates
- Client components subscribe to Firestore changes
- Server-side initial data + client-side real-time sync
- Best of both worlds

## Routes

- `/` - Public attendance view (SSR)
- `/login` - Admin login
- `/admin` - Admin dashboard (protected)

## Development Notes

### Client vs Server Components

- **Server Components** (default):
  - Used for data fetching
  - No interactivity needed
  - Example: `app/page.tsx`

- **Client Components** ('use client'):
  - Need interactivity (hooks, event handlers)
  - Real-time subscriptions
  - Example: `PublicAttendanceClient.tsx`

### Server Actions

Server Actions are used for all mutations:
- `updateAttendanceStatus()` - Update user attendance
- `addCategory()` - Create new category
- `addUserToCategory()` - Add user to category
- `deleteCategory()` - Remove category
- `resetMonthlyAttendance()` - Reset attendance data

Benefits:
- No need to create API routes
- Automatic CSRF protection
- Progressive enhancement

## TODO

- [x] Set up Next.js project
- [x] Configure Firebase (client + admin)
- [x] Migrate types and constants
- [x] Migrate components
- [x] Implement Server Actions
- [x] Create public page with SSR
- [x] Create login page
- [x] Create authentication middleware
- [ ] Migrate admin page
- [ ] Test all functionality
- [ ] Deploy to Vercel/Firebase Hosting

## Deployment

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions**

### Quick Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Or use the helper script:
```bash
./scripts/deploy-vercel.sh
```

## License

Private project for Baitul Ilmi educational institution.
