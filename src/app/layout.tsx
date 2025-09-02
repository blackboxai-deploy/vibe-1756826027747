import './globals.css';

export const metadata = {
  title: 'Block Breaker Game',
  description: 'Classic block breaker arcade game built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}