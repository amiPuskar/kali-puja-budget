'use client';

import { Plus } from 'lucide-react';

const PageHeader = ({ 
  title, 
  description, 
  buttonText, 
  onButtonClick, 
  buttonIcon: ButtonIcon = Plus,
  showButton = true 
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {showButton && (
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={onButtonClick}
              className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto lg:w-auto sm:min-w-[140px] lg:min-w-[160px] order-2 sm:order-1 lg:order-1"
            >
              <ButtonIcon className="w-4 h-4" />
              <span>{buttonText}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
