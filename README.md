# 📅 Booking System

Eine moderne, produktionsreife Buchungssystem-Anwendung, gebaut mit **Next.js 15**, **Tailwind CSS**, **TypeScript** und **Supabase**.

🇩🇪 **100% auf Deutsch** | 📱 **Responsive Design** | 🎨 **Moderne UI** | ⚡ **Schnell & Sicher**

## ✅ Status (Stand: 15.02.2026)

- **Kern-Features**: Auth, Dashboard, Standorte, Buchungen, Kalender, Services, Ressourcen, Settings
- **UX**: Dark Mode, Toasts, Loading States, Error Boundaries
- **Mock-Mode**: Lokales Testing ohne Live-Datenbank
- **Analytics**: Buchungstrends-Chart
- **Validierungen**: Zod-Schemas + API Error Handling

## 🚀 Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (configured via environment variables)
- **Code Quality**: ESLint + Next.js linting

## 📁 Project Structure

```
booking-system/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   └── ui/                # shadcn/ui components
│       └── button.tsx     # Example Button component
├── lib/
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Domain types (User, Booking, Service)
│   ├── utils/             # Utility functions
│   │   └── index.ts       # cn(), formatDate(), formatTime()
│   └── client/            # Client-side utilities
│       └── index.ts       # Client-only helpers
├── server/                # Server-side code
│   ├── actions.ts         # Next.js Server Actions
│   └── db.ts              # Database initialization
├── styles/                # Global styles
│   └── globals.css        # Tailwind + base styles
├── public/                # Static assets
├── .env.example           # Environment template
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in and create a new project
3. Copy your project credentials

### 3. Configure Environment

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_MOCK_MODE=false
```

### 4. Push Database Schema to Supabase

Install Supabase CLI:

```bash
brew install supabase/tap/supabase
```

Push migrations:

```bash
./scripts/migrate-to-supabase.sh
```

Or manually:

```bash
supabase link --project-ref [your-project-id]
supabase db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Mock-Mode (ohne Live-DB)

Wenn du lokal ohne Supabase testen möchtest, setze:

```
NEXT_PUBLIC_MOCK_MODE=true
```

Der Mock-Mode liefert Demo-Daten für Dashboard, Kalender, Standorte, Leistungen und Ressourcen.

## 📊 Database Schema

The booking system includes a comprehensive multi-tenant database with:

- **Organizations** - Multi-tenant organization support
- **Locations** - Multiple branches/locations per organization
- **Offerings** - Services/products with pricing and capacity
- **Resources** - Staff, tables, rooms, equipment
- **Schedules** - Working hours and availability
- **Blocks** - Holidays, breaks, maintenance periods
- **Bookings** - Customer reservations with status tracking
- **Audit Logs** - Compliance and change tracking
- **Notifications** - Email/SMS tracking

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete schema documentation.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Adding shadcn/ui Components

To add more UI components:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
```

## 📦 Key Dependencies

- **react** & **react-dom** - React framework
- **next** - Next.js framework
- **tailwindcss** - Utility-first CSS
- **class-variance-authority** - Component variants
- **clsx** & **tailwind-merge** - Utility functions
- **lucide-react** - Icon library

## 🔐 Security

- Environment variables are validated with `.env.example`
- Sensitive keys (SERVICE_ROLE_KEY) stay server-side only
- Public keys (ANON_KEY) are prefixed with `NEXT_PUBLIC_`

## 📚 Next Steps

1. **Database Setup** - Configure Supabase tables (users, bookings, services)
2. **Authentication** - Implement Supabase Auth
3. **API Routes** - Create server actions and API endpoints
4. **UI Components** - Add more shadcn/ui components as needed
5. **Testing** - Set up testing framework (Jest + React Testing Library)

## 📄 License

This project is part of a larger booking system. All rights reserved.
