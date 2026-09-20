import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  aspectRatio?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
  aspectRatio,
  loading = 'lazy',
  decoding = 'async',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#F7F3EB] ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Lightweight blur/shimmer skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EB] via-[#EDE7DB] to-[#F7F3EB] animate-pulse" />
      )}

      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) setHasError(true);
        }}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          isLoaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-[1.02] blur-sm'
        } ${className}`}
        {...props}
      />
    </div>
  );
};
