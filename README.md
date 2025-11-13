# ARSC Printing Service

A modern web application for campus printing services built with React, TypeScript, and Vite.

## About

Cetak Cepat Kuy is a digital printing service platform developed for ARSC (Academic Resource and Service Center) that allows students and faculty to:

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

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- bun package manager

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

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run build:dev` - Build for development
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary to ARSC Printing services.
