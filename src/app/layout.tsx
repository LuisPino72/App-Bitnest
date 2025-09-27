import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MLM Dashboard - Gestión de Referidos',
  description: 'Sistema profesional de gestión de referidos multinivel con análisis y proyecciones',
  keywords: ['MLM', 'referidos', 'inversiones', 'dashboard', 'análisis'],
  authors: [{ name: 'MLM Dashboard' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}