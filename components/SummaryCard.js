'use client';

import React from 'react';

const SummaryCard = ({ 
  items = [], 
  className = "",
  iconSize = "default", // "small", "default", "large"
  layout = "auto", // "auto", "horizontal", "vertical", "grid"
  title = null,
  subtitle = null
}) => {
  const getIconSize = () => {
    switch (iconSize) {
      case "small":
        return "w-4 h-4 sm:w-5 sm:h-5";
      case "large":
        return "w-6 h-6 sm:w-8 sm:h-8";
      default:
        return "w-5 h-5 sm:w-6 sm:h-6";
    }
  };

  const getPaddingSize = () => {
    switch (iconSize) {
      case "small":
        return "p-1.5 sm:p-2";
      case "large":
        return "p-3 sm:p-4";
      default:
        return "p-2 sm:p-3";
    }
  };

  const getTextSize = () => {
    switch (iconSize) {
      case "small":
        return "text-lg sm:text-xl";
      case "large":
        return "text-2xl sm:text-3xl";
      default:
        return "text-xl sm:text-2xl";
    }
  };

  const getGridLayout = () => {
    if (layout === "horizontal") {
      return "flex flex-col sm:flex-row gap-4";
    }
    if (layout === "vertical") {
      return "flex flex-col gap-4";
    }
    if (layout === "grid") {
      return `grid gap-4 ${
        items.length === 1 ? 'grid-cols-1' :
        items.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        items.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`;
    }
    // Auto layout
    return `grid gap-4 ${
      items.length === 1 ? 'grid-cols-1' :
      items.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
      items.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`;
  };

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Items */}
      <div className={getGridLayout()}>
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className={`flex-shrink-0 ${getPaddingSize()} ${item.bgColor || 'bg-blue-100'} rounded-lg`}>
                <Icon className={`${getIconSize()} ${item.color || 'text-blue-600'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className={`${getTextSize()} font-semibold text-gray-900`}>
                  {item.value}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SummaryCard;
