import { Instrument_Sans } from 'next/font/google';

const font = Instrument_Sans({ subsets: ['latin'], weight: ['400','500','600','700'] });

export const metadata = {
  title: 'Good Times — Partner Application',
  description: 'Get your venue, brand, or event featured on Good Times — the premier nightlife, dining & entertainment app.',
  openGraph: {
    title: 'Good Times — Partner Application',
    description: 'Apply to be featured on the Good Times app. Submit your venue, specials, events, and more.',
    url: 'https://partners.thegoodtimesworldwide.com',
    siteName: 'Good Times',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className} style={{ margin: 0, padding: 0, background: '#0A0A0A' }}>
        {children}
      </body>
    </html>
  );
}
