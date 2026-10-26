import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PG Finder AI | Student Accommodation Discovery in India',
  description:
    'Find authentic, verified student PG accommodations with meals, Wi-Fi, and transparent pricing. Powered by local Ollama AI assistance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
