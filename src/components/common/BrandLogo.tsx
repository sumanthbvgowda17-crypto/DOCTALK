import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  alt = 'DocTalk'
}) => {
  if (variant === 'icon') {
    const sizeMap = {
      xs: 'w-5 h-5',
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    };

    return (
      <img
        src="/doctalk-icon.png"
        alt={alt}
        className={`${sizeMap[size]} object-contain shrink-0 ${className}`}
      />
    );
  }

  // Full Logo variant
  const heightMap = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Light Mode Logo */}
      <img
        src="/doctalk-logo-light.png"
        alt={alt}
        className={`${heightMap[size]} w-auto object-contain block dark:hidden`}
      />
      {/* Dark Mode Logo */}
      <img
        src="/doctalk-logo-dark.png"
        alt={alt}
        className={`${heightMap[size]} w-auto object-contain hidden dark:block`}
      />
    </div>
  );
};
