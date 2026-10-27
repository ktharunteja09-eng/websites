import React from 'react';

export interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  variant?: 'navbar' | 'full' | 'hero' | 'footer' | 'badge';
  showPlate?: boolean;
  glow?: boolean;
  idSuffix?: string;
}

/**
 * BrandLogo - Faithful Recreation of the Vaibhav Grand Family Restaurant Illuminated Sign
 * Features:
 * 1. Top Pegasus (Winged Horse) in glowing fiery neon red/coral
 * 2. "VAIBHAV" in brilliant 3D white channel lettering with electric cyan/blue neon glow
 * 3. Two stylized neon magenta/pink wings flanking the center
 * 4. "GRAND" in bright luminous golden yellow neon
 * 5. "FAMILY RESTAURANT" in vivid electric neon lime-green
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-auto h-12',
  variant = 'navbar',
  showPlate = false,
  glow = true,
  idSuffix = 'default',
  ...props
}) => {
  const redGlowId = `vg-red-glow-${idSuffix}`;
  const cyanGlowId = `vg-cyan-glow-${idSuffix}`;
  const yellowGlowId = `vg-yellow-glow-${idSuffix}`;
  const pinkGlowId = `vg-pink-glow-${idSuffix}`;
  const greenGlowId = `vg-green-glow-${idSuffix}`;
  const plateGradId = `vg-plate-grad-${idSuffix}`;
  const wingGradId = `vg-wing-grad-${idSuffix}`;

  return (
    <svg
      viewBox="0 0 300 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Vaibhav Grand Family Restaurant Neon Sign Logo"
      className={`select-none overflow-visible ${className}`}
      {...props}
    >
      <defs>
        {/* Signboard Backplate Gradient (Midnight Sky with Sheen) */}
        <linearGradient id={plateGradId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#0B132B" />
          <stop offset="50%" stopColor="#060914" />
          <stop offset="100%" stopColor="#020409" />
        </linearGradient>

        {/* Pink Neon Wing Gradient */}
        <linearGradient id={wingGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA4D5" />
          <stop offset="35%" stopColor="#FF2E93" />
          <stop offset="100%" stopColor="#D80064" />
        </linearGradient>

        {/* Neon Glow Filters */}
        {glow && (
          <>
            {/* Fiery Red Glow for Pegasus */}
            <filter id={redGlowId} x="-35%" y="-35%" width="170%" height="170%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="5.5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Ice Blue / Cyan Glow for VAIBHAV */}
            <filter id={cyanGlowId} x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="1.8" result="blur1" />
              <feGaussianBlur stdDeviation="4.5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Warm Golden Yellow Glow for GRAND */}
            <filter id={yellowGlowId} x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="5.5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Electric Magenta-Pink Glow for Flanking Wings */}
            <filter id={pinkGlowId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.8" result="blur1" />
              <feGaussianBlur stdDeviation="5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Electric Lime Green Glow for FAMILY RESTAURANT */}
            <filter id={greenGlowId} x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="1.8" result="blur1" />
              <feGaussianBlur stdDeviation="4.8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </>
        )}
      </defs>

      {/* Optional Midnight Signboard Backplate */}
      {showPlate && (
        <g className="signboard-plate">
          <rect
            x="3"
            y="3"
            width="294"
            height="159"
            rx="16"
            fill={`url(#${plateGradId})`}
            stroke="#1E293B"
            strokeWidth="1.5"
          />
          {/* Subtle Ambient Night Sky Radial Glows from Neon */}
          <circle cx="150" cy="26" r="38" fill="#FF1E42" opacity="0.16" />
          <circle cx="150" cy="74" r="48" fill="#38BDF8" opacity="0.13" />
          <circle cx="150" cy="112" r="38" fill="#FFD700" opacity="0.15" />
          <circle cx="68" cy="110" r="30" fill="#FF2E93" opacity="0.16" />
          <circle cx="232" cy="110" r="30" fill="#FF2E93" opacity="0.16" />
          <circle cx="150" cy="146" r="42" fill="#00E676" opacity="0.15" />
        </g>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP ELEMENT: PEGASUS (WINGED HORSE) IN GLOWING FIERY NEON RED/CORAL    */}
      {/* ========================================================================= */}
      <g
        id="top-winged-horse"
        transform="translate(126.5, 4) scale(0.55)"
        filter={glow ? `url(#${redGlowId})` : undefined}
      >
        {/* Ambient Under-glow silhouette */}
        <g fill="#FF002B" opacity="0.65">
          {/* Secondary Flared Wing */}
          <path d="M 50 36 C 48 27, 46 15, 54 4 C 51 10, 49 16, 51 24 C 47 18, 44 12, 48 6 C 45 13, 43 20, 46 28 C 43 23, 40 18, 43 13 C 41 19, 40 26, 44 33 C 42 30, 40 26, 42 22 C 40 27, 40 33, 45 38 Z" />
          {/* Primary High-Sweeping Wing */}
          <path d="M 43 40 C 40 29, 36 14, 46 2 C 42 9, 39 17, 42 26 C 38 18, 33 10, 39 4 C 35 12, 33 21, 37 30 C 33 23, 29 16, 34 10 C 30 18, 29 27, 33 35 C 29 28, 26 22, 30 17 C 27 25, 27 34, 32 42 C 35 45, 39 46, 44 45 C 44 43, 43 41, 43 40 Z" />
          {/* Head & Neck */}
          <path d="M 44 43 C 47 43, 50 41, 52 38 C 54 36, 55 31, 55 26 C 55 24, 57 23, 59 21 C 61 19, 64 20, 66 22 C 67 23, 69 22, 70 21 C 69 20, 67 17, 65 16 C 64 14, 62 13, 61 15 C 60 13, 58 15, 57 17 C 55 19, 53 21, 51 24 C 48 27, 46 30, 45 34 C 45 37, 44 40, 44 43 Z" />
          {/* Forelegs */}
          <path d="M 52 38 C 54 40, 57 43, 61 45 C 65 47, 70 48, 73 47 C 74 46, 75 44, 73 43 C 69 43, 66 42, 63 39 C 60 36, 57 34, 55 34 L 53 38 Z" />
          <path d="M 51 40 C 52 44, 55 49, 58 53 C 60 55, 62 54, 61 52 C 59 48, 57 44, 54 41 Z" />
          {/* Torso & Hind Legs */}
          <path d="M 44 45 C 38 46, 33 48, 29 52 C 26 56, 24 62, 21 70 L 24 71 C 26 66, 28 61, 30 58 C 31 61, 33 67, 36 74 L 39 73 C 37 66, 35 59, 34 54 C 38 55, 43 55, 47 52 C 49 50, 51 47, 52 44 C 49 46, 46 46, 44 45 Z" />
          {/* Flowing Tail */}
          <path d="M 31 51 C 27 52, 22 55, 17 60 C 14 63, 12 68, 10 74 C 13 70, 16 67, 20 65 C 17 69, 15 75, 14 81 C 18 76, 22 72, 25 69 C 23 74, 22 79, 22 84 C 25 78, 28 73, 30 68 C 32 64, 32 57, 31 51 Z" />
        </g>

        {/* Foreground Neon Red/Coral Silhouette */}
        <g fill="#FF2647">
          <path d="M 50 36 C 48 27, 46 15, 54 4 C 51 10, 49 16, 51 24 C 47 18, 44 12, 48 6 C 45 13, 43 20, 46 28 C 43 23, 40 18, 43 13 C 41 19, 40 26, 44 33 C 42 30, 40 26, 42 22 C 40 27, 40 33, 45 38 Z" opacity="0.9" />
          <path d="M 43 40 C 40 29, 36 14, 46 2 C 42 9, 39 17, 42 26 C 38 18, 33 10, 39 4 C 35 12, 33 21, 37 30 C 33 23, 29 16, 34 10 C 30 18, 29 27, 33 35 C 29 28, 26 22, 30 17 C 27 25, 27 34, 32 42 C 35 45, 39 46, 44 45 C 44 43, 43 41, 43 40 Z" />
          <path d="M 44 43 C 47 43, 50 41, 52 38 C 54 36, 55 31, 55 26 C 55 24, 57 23, 59 21 C 61 19, 64 20, 66 22 C 67 23, 69 22, 70 21 C 69 20, 67 17, 65 16 C 64 14, 62 13, 61 15 C 60 13, 58 15, 57 17 C 55 19, 53 21, 51 24 C 48 27, 46 30, 45 34 C 45 37, 44 40, 44 43 Z" />
          <path d="M 52 38 C 54 40, 57 43, 61 45 C 65 47, 70 48, 73 47 C 74 46, 75 44, 73 43 C 69 43, 66 42, 63 39 C 60 36, 57 34, 55 34 L 53 38 Z" />
          <path d="M 51 40 C 52 44, 55 49, 58 53 C 60 55, 62 54, 61 52 C 59 48, 57 44, 54 41 Z" />
          <path d="M 44 45 C 38 46, 33 48, 29 52 C 26 56, 24 62, 21 70 L 24 71 C 26 66, 28 61, 30 58 C 31 61, 33 67, 36 74 L 39 73 C 37 66, 35 59, 34 54 C 38 55, 43 55, 47 52 C 49 50, 51 47, 52 44 C 49 46, 46 46, 44 45 Z" />
          <path d="M 31 51 C 27 52, 22 55, 17 60 C 14 63, 12 68, 10 74 C 13 70, 16 67, 20 65 C 17 69, 15 75, 14 81 C 18 76, 22 72, 25 69 C 23 74, 22 79, 22 84 C 25 78, 28 73, 30 68 C 32 64, 32 57, 31 51 Z" />
        </g>

        {/* Luminous Inner Core Accent */}
        <path
          d="M 46 38 C 44 32, 42 22, 47 14 C 44 20, 43 27, 45 34 Z"
          fill="#FFA3B0"
          opacity="0.9"
        />
        <circle cx="62" cy="21" r="1.5" fill="#FFE5E9" />
      </g>

      {/* ========================================================================= */}
      {/* 2. MAIN WORD: "VAIBHAV" (ILLUMINATED WHITE WITH CYAN/BLUE 3D HALO)       */}
      {/* ========================================================================= */}
      <g id="word-vaibhav">
        {/* 3D Cyan Extrusion Shadow & Neon Backglow */}
        <text
          x="150"
          y="84"
          textAnchor="middle"
          fill="#0284C7"
          stroke="#00E5FF"
          strokeWidth="3.2"
          strokeLinejoin="round"
          filter={glow ? `url(#${cyanGlowId})` : undefined}
          style={{
            fontFamily: "'Montserrat', 'Outfit', 'Inter', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '37px',
            letterSpacing: '0.06em',
          }}
        >
          VAIBHAV
        </text>

        {/* Deep navy 3D bottom bevel */}
        <text
          x="150"
          y="84.5"
          textAnchor="middle"
          fill="#0C4A6E"
          style={{
            fontFamily: "'Montserrat', 'Outfit', 'Inter', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '37px',
            letterSpacing: '0.06em',
          }}
        >
          VAIBHAV
        </text>

        {/* Crisp Front Face: Gleaming Pure White */}
        <text
          x="150"
          y="82"
          textAnchor="middle"
          fill="#FFFFFF"
          stroke="#F0F9FF"
          strokeWidth="0.6"
          style={{
            fontFamily: "'Montserrat', 'Outfit', 'Inter', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '37px',
            letterSpacing: '0.06em',
          }}
        >
          VAIBHAV
        </text>
      </g>

      {/* ========================================================================= */}
      {/* 3. FLANKING WINGS (2 WINGS IN VIVID NEON MAGENTA/PINK)                     */}
      {/* ========================================================================= */}
      {/* Left Wing (Mirrored) */}
      <g
        id="left-neon-wing"
        transform="translate(76, 114) scale(-1.12, 1.12)"
        filter={glow ? `url(#${pinkGlowId})` : undefined}
      >
        {/* Outer Feather Plumage */}
        <path
          d="M 2 24
             C 6 26, 12 28, 18 26.5
             C 24 25, 27 22, 28 19
             C 24 18.5, 21 17.5, 19 16.5
             C 26 15, 33 11.5, 35 6
             C 29 6.5, 24 6.8, 20 6
             C 27 3.5, 33 -1, 35 -7
             C 28 -4.5, 21 -2.5, 16 0
             C 23 -4.5, 27 -10.5, 29 -17
             C 21 -14, 13 -9, 8 -3
             C 3 4, 1 14, 2 24 Z"
          fill={`url(#${wingGradId})`}
        />
        {/* Radiant Inner Feathers / Neon Spine Lines */}
        <path
          d="M 6 18 Q 16 18 24 16
             M 7 13 Q 18 10 29 4
             M 8 7 Q 18 0 28 -9
             M 8 1 Q 16 -7 23 -14"
          stroke="#FFF0F7"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />
      </g>

      {/* Right Wing */}
      <g
        id="right-neon-wing"
        transform="translate(224, 114) scale(1.12, 1.12)"
        filter={glow ? `url(#${pinkGlowId})` : undefined}
      >
        {/* Outer Feather Plumage */}
        <path
          d="M 2 24
             C 6 26, 12 28, 18 26.5
             C 24 25, 27 22, 28 19
             C 24 18.5, 21 17.5, 19 16.5
             C 26 15, 33 11.5, 35 6
             C 29 6.5, 24 6.8, 20 6
             C 27 3.5, 33 -1, 35 -7
             C 28 -4.5, 21 -2.5, 16 0
             C 23 -4.5, 27 -10.5, 29 -17
             C 21 -14, 13 -9, 8 -3
             C 3 4, 1 14, 2 24 Z"
          fill={`url(#${wingGradId})`}
        />
        {/* Radiant Inner Feathers / Neon Spine Lines */}
        <path
          d="M 6 18 Q 16 18 24 16
             M 7 13 Q 18 10 29 4
             M 8 7 Q 18 0 28 -9
             M 8 1 Q 16 -7 23 -14"
          stroke="#FFF0F7"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />
      </g>

      {/* ========================================================================= */}
      {/* 4. CENTER WORD: "GRAND" IN LUMINOUS GOLDEN YELLOW NEON                    */}
      {/* ========================================================================= */}
      <g id="word-grand">
        {/* Golden Amber Shadow & Halo */}
        <text
          x="150"
          y="122"
          textAnchor="middle"
          fill="#D97706"
          stroke="#FFD700"
          strokeWidth="2.4"
          strokeLinejoin="round"
          filter={glow ? `url(#${yellowGlowId})` : undefined}
          style={{
            fontFamily: "'Montserrat', 'Outfit', 'Inter', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '31px',
            letterSpacing: '0.08em',
          }}
        >
          GRAND
        </text>

        {/* Front Core: Pure Radiant Canary Yellow */}
        <text
          x="150"
          y="121"
          textAnchor="middle"
          fill="#FFE600"
          stroke="#FFFBEB"
          strokeWidth="0.5"
          style={{
            fontFamily: "'Montserrat', 'Outfit', 'Inter', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '31px',
            letterSpacing: '0.08em',
          }}
        >
          GRAND
        </text>
      </g>

      {/* ========================================================================= */}
      {/* 5. BOTTOM LINE: "FAMILY RESTAURANT" IN ELECTRIC NEON LIME GREEN          */}
      {/* ========================================================================= */}
      <g id="word-family-restaurant">
        {/* Neon Green Halo */}
        <text
          x="150"
          y="153"
          textAnchor="middle"
          fill="#059669"
          stroke="#00E676"
          strokeWidth="2.2"
          strokeLinejoin="round"
          filter={glow ? `url(#${greenGlowId})` : undefined}
          style={{
            fontFamily: "'Montserrat', 'Outfit', 'Inter', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '17px',
            letterSpacing: '0.18em',
          }}
        >
          FAMILY RESTAURANT
        </text>

        {/* Crisp Front Face: Vivid Electric Green */}
        <text
          x="150"
          y="152.5"
          textAnchor="middle"
          fill="#22E54B"
          stroke="#ECFDF5"
          strokeWidth="0.4"
          style={{
            fontFamily: "'Montserrat', 'Outfit', 'Inter', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '17px',
            letterSpacing: '0.18em',
          }}
        >
          FAMILY RESTAURANT
        </text>
      </g>
    </svg>
  );
};
