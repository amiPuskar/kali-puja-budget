'use client';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">PB</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Puja Budget Management System</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
            © {new Date().getFullYear()} Puskar Koley. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
