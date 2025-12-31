# ARSC Printing - Cetak Dokumen Tanpa Antre

A modern web application for campus printing services built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## About

ARSC Printing is a digital printing service platform developed for ARSC (Academic Resource and Service Center) that allows students and faculty to:

- Upload documents for printing from anywhere
- Track printing queue status in real-time
- Receive notifications when orders are ready
- Manage printing orders through an intuitive web interface

## Features

- **Real-time Queue Monitoring**: Live updates on printing queue status
- **Document Upload**: Support for various document formats
- **Order Management**: Track and manage printing orders
- **Admin Dashboard**: Administrative tools for managing the printing service
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **SSR Ready**: Server-side rendering for optimal performance

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Form Handling**: React Hook Form with Zod validation
- **Package Manager**: Bun
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 20.9 or higher
- Bun package manager

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

3. Start the development server:
```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home page
│   ├── order/         # Order page
│   ├── order-success/ # Order success page
│   ├── admin/         # Admin dashboard
│   └── not-found.tsx  # 404 page
├── components/        # Reusable UI components
│   └── ui/           # shadcn/ui components
├── contexts/         # React contexts for state management
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── types/            # TypeScript type definitions
```

## Deployment

This project is configured for Vercel deployment. Simply connect your GitHub repository to Vercel for automatic deployments.

```bash
# Build for production
bun run build

# Start production server (for self-hosting)
bun run start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary to ARSC Printing services.
