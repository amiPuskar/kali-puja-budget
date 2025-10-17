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
    <div className="mb-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
        
        {showButton && (
          <div className="w-full sm:w-auto sm:flex-shrink-0">
            <button
              onClick={onButtonClick}
              className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2"
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
