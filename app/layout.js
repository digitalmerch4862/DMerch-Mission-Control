const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Mission Control',
    template: '%s | Mission Control',
  },
  description: 'Mission Control dashboard status and environment overview.',
  applicationName: 'Mission Control',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Mission Control',
    description: 'Mission Control dashboard status and environment overview.',
    url: '/',
    siteName: 'Mission Control',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mission Control',
    description: 'Mission Control dashboard status and environment overview.',
  },
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
