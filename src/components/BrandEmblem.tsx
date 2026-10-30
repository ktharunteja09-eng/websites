import React from 'react';

export interface BrandEmblemProps {
  className?: string;
  size?: number | string;
  color?: string;
  idSuffix?: string;
  alt?: string;
  priority?: boolean;
  [key: string]: any;
}

/**
 * BrandEmblem - Official Vaibhav Grand Family Restaurant Winged Horse Logo.
 * Displays the transparent, high-resolution master logo.
 * Maintains exact natural proportions without distortion.
 */
export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  className = 'h-10 w-auto object-contain',
  alt = 'Vaibhav Grand Family Restaurant Logo',
  size,
  color,
  idSuffix,
  priority,
  ...props
}) => {
  return (
    <img
      src="/assets/images/vaibhav-grand-logo-red.png"
      alt={alt}
      width={1766}
      height={866}
      fetchPriority={priority ? 'high' : 'auto'}
      className={`object-contain select-none ${className}`}
      {...props}
    />
  );
};
