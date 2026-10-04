import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  priority?: boolean;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
  aspectRatio,
  loading = 'lazy',
  decoding = 'async',
  width = 800,
  height = 600,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const checkStatus = useCallback((img: HTMLImageElement | null) => {
    if (!img) return;
    if (img.complete) {
      if (img.naturalWidth > 0) {
        setIsLoaded(true);
        setHasError(false);
      } else {
        setHasError(true);
      }
    }
  }, []);

  // Callback ref: checks immediately when DOM node is attached or hydrated
  const setRef = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node;
      checkStatus(node);
    },
    [checkStatus]
  );

  // Synchronous layout effect on hydration/mount before paint
  useIsomorphicLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    checkStatus(img);

    const handleLoad = () => {
      setIsLoaded(true);
      setHasError(false);
    };

    const handleError = () => {
      setHasError(true);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, fallbackSrc, checkStatus]);

  const handleImgLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImgError = () => {
    if (!hasError) setHasError(true);
  };

  const effectiveLoading = priority ? 'eager' : loading;
  const effectiveFetchPriority = priority ? 'high' : (props as { fetchPriority?: 'high' | 'low' | 'auto' }).fetchPriority;

  return (
    <div
      className={`relative overflow-hidden bg-[#F7F3EB] ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Lightweight blur/shimmer skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EB] via-[#EDE7DB] to-[#F7F3EB] animate-pulse pointer-events-none" />
      )}

      <img
        ref={setRef}
        src={hasError ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        loading={effectiveLoading}
        decoding={decoding}
        referrerPolicy="no-referrer"
        onLoad={handleImgLoad}
        onError={handleImgError}
        fetchPriority={effectiveFetchPriority}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          isLoaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-[1.02] blur-sm'
        } ${className}`}
        {...props}
      />
    </div>
  );
};
