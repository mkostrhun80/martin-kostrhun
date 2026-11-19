import { PrivacyPreferences } from '@/components/site/PrivacyPreferences';
import type { Metadata } from 'next';
import { Newsreader, Plus_Jakarta_Sans } from 'next/font/google';
import { sitePath } from '@/lib/site-path';
import { homeScrollBootstrap } from '@/lib/home-scroll';
import { siteConfig } from '@/lib/site-config';
import './tokens.css';
import './globals.css';
import './sections.css';

const serif = Newsreader({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  description: siteConfig.description,
  icons: {
    icon: sitePath('/favicon.svg'),
    shortcut: sitePath('/favicon.svg'),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main">
          Přejít k obsahu
        </a>
        <script dangerouslySetInnerHTML={{ __html: homeScrollBootstrap }} />
        <PrivacyPreferences>{children}</PrivacyPreferences>
      </body>
    </html>
  );
}
