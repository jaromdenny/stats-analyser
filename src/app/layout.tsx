import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cryptocurrency Analysis',
  description: 'Analyze cryptocurrency data with technical indicators',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 