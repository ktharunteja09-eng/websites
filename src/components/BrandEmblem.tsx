import React from 'react';

interface BrandEmblemProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  color?: string;
  idSuffix?: string;
}

/**
 * BrandEmblem - Simplified Golden Winged Horse (Pegasus) icon
 * Faithfully recreated from the storefront signage of Vaibhav Grand Family Restaurant.
 * Optimized for small-scale crispness (32px-40px) with clean heraldic silhouette lines.
 */
export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  className = 'w-9 h-9',
  size,
  color = '#D4AF37',
  idSuffix = 'default',
  ...props
}) => {
  const gradientId = `vaibhav-gold-gradient-${idSuffix}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Vaibhav Grand Winged Horse Emblem"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="15%" y1="5%" x2="85%" y2="95%">
          <stop offset="0%" stopColor="#F9E8A2" />
          <stop offset="35%" stopColor="#E5C158" />
          <stop offset="70%" stopColor={color} />
          <stop offset="100%" stopColor="#B38610" />
        </linearGradient>
      </defs>

      <g fill={`url(#${gradientId})`}>
        {/* Background Wing Layer (Secondary Flared Wing) */}
        <path
          d="M 50 36 
             C 48 27, 46 15, 54 4 
             C 51 10, 49 16, 51 24 
             C 47 18, 44 12, 48 6 
             C 45 13, 43 20, 46 28 
             C 43 23, 40 18, 43 13 
             C 41 19, 40 26, 44 33 
             C 42 30, 40 26, 42 22 
             C 40 27, 40 33, 45 38 
             Z"
          opacity="0.8"
        />

        {/* Foreground Wing Layer (Grand Tiered Feather Plumes sweeping high) */}
        <path
          d="M 43 40 
             C 40 29, 36 14, 46 2 
             C 42 9, 39 17, 42 26 
             C 38 18, 33 10, 39 4 
             C 35 12, 33 21, 37 30 
             C 33 23, 29 16, 34 10 
             C 30 18, 29 27, 33 35 
             C 29 28, 26 22, 30 17 
             C 27 25, 27 34, 32 42 
             C 35 45, 39 46, 44 45 
             C 44 43, 43 41, 43 40 
             Z"
        />

        {/* Horse Head, Crest, Mane & Upper Neck */}
        <path
          d="M 44 43 
             C 47 43, 50 41, 52 38 
             C 54 36, 55 31, 55 26 
             C 55 24, 57 23, 59 21 
             C 61 19, 64 20, 66 22 
             C 67 23, 69 22, 70 21 
             C 69 20, 67 17, 65 16 
             C 64 14, 62 13, 61 15 
             C 60 13, 58 15, 57 17 
             C 55 19, 53 21, 51 24 
             C 48 27, 46 30, 45 34
             C 45 37, 44 40, 44 43 
             Z"
        />

        {/* Chest & Upper Foreleg (Reaching Forward) */}
        <path
          d="M 52 38 
             C 54 40, 57 43, 61 45 
             C 65 47, 70 48, 73 47 
             C 74 46, 75 44, 73 43 
             C 69 43, 66 42, 63 39 
             C 60 36, 57 34, 55 34 
             L 53 38 
             Z"
        />

        {/* Secondary Foreleg (Bent at knee in Prance/Canter) */}
        <path
          d="M 51 40 
             C 52 44, 55 49, 58 53 
             C 60 55, 62 54, 61 52 
             C 59 48, 57 44, 54 41 
             Z"
        />

        {/* Muscular Torso, Haunch & Hind Legs */}
        <path
          d="M 44 45 
             C 38 46, 33 48, 29 52 
             C 26 56, 24 62, 21 70 
             L 24 71 
             C 26 66, 28 61, 30 58 
             C 31 61, 33 67, 36 74 
             L 39 73 
             C 37 66, 35 59, 34 54 
             C 38 55, 43 55, 47 52 
             C 49 50, 51 47, 52 44 
             C 49 46, 46 46, 44 45 
             Z"
        />

        {/* Layered Flowing Tail plumes */}
        <path
          d="M 31 51 
             C 27 52, 22 55, 17 60 
             C 14 63, 12 68, 10 74 
             C 13 70, 16 67, 20 65 
             C 17 69, 15 75, 14 81 
             C 18 76, 22 72, 25 69 
             C 23 74, 22 79, 22 84 
             C 25 78, 28 73, 30 68 
             C 32 64, 32 57, 31 51 
             Z"
        />
      </g>
    </svg>
  );
};
