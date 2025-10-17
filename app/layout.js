import './globals.css';

export const metadata = {
  title: 'Puja Budget',
  description: 'Budget management system for Puja committee',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
