import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToasterProvider from '@/components/ToasterProvider';

export const metadata = {
  title: 'Puja Budget',
  description: 'Budget management system for Puja committee',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Header />
        <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex-1 w-full">
          {children}
        </main>
        <Footer />
        <ToasterProvider />
      </body>
    </html>
  );
}
