# ARSC Printing Service

A modern web application for campus printing services built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Supabase.

## About

ARSC Printing is a digital printing service platform developed for ARSC (Academic Resource and Service Center) that allows students and faculty to:

- Upload documents for printing from anywhere
- Track printing queue status in real-time
- Receive notifications when orders are ready
- Manage printing orders through an intuitive web interface

## Features

- **Real-time Queue Monitoring**: Live updates on printing queue status via Supabase Realtime
- **Document Upload**: Upload PDF, DOC, DOCX files to Supabase Storage
- **Order Tracking**: Track orders using unique order IDs
- **Admin Dashboard**: Protected admin panel with Supabase Auth
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **SSR Ready**: Server-side rendering for optimal performance

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Package Manager**: Bun
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 20.9 or higher
- Bun package manager
- Supabase account (free tier available)

### Supabase Setup

1. Create a new project at [database.new](https://database.new)

2. Go to SQL Editor and run the contents of `supabase-schema.sql`

3. Create an admin user:
   - Go to Authentication > Users
   - Click "Add user" > "Create new user"
   - Email: `admin@arsc-printing.com`
   - Password: `admin123` (change in production!)

4. Get your API keys:
   - Go to Settings > API
   - Copy the Project URL and anon/public key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/adsurkasur/arsc-printing.git
cd arsc-printing
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Start the development server:
```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── order/           # Order form page
│   ├── order-success/   # Order success page
│   ├── track/           # Order tracking page
│   ├── admin/           # Admin dashboard (protected)
│   │   └── login/       # Admin login page
│   ├── api/             # API routes
│   │   ├── orders/      # Orders CRUD API
│   │   └── upload/      # File upload API
│   └── not-found.tsx    # 404 page
├── components/          # Reusable UI components
│   └── ui/              # shadcn/ui components
├── contexts/            # React contexts for state management
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
│   └── supabase/        # Supabase client utilities
└── types/               # TypeScript type definitions
```

## User Workflows

### Customer Flow
1. Upload document on `/order` page
2. Select print settings (color, copies, paper size)
3. Enter contact information
4. Submit order and receive order ID
5. Track order status on `/track` page

### Admin Flow
1. Login at `/admin/login` with admin credentials
2. View all orders on dashboard
3. Update order status (pending → printing → completed)
4. Download uploaded documents

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## Free Tier Limits (Supabase)

- Database: 500MB storage
- File Storage: 1GB with 2GB bandwidth/month
- Authentication: 50,000 monthly active users
- Realtime: Included

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary to ARSC Printing services.
