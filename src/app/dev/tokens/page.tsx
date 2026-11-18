import { notFound } from 'next/navigation';
import { TokensClient } from './TokensClient';

export const metadata = {
  title: 'M3 Design Tokens & Component State Contract — Development Fixture',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DevTokensPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <TokensClient />;
}
