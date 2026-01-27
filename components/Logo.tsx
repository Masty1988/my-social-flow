import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background rounded square */}
    <rect width="100" height="100" rx="22" fill="#2563EB" />

    {/* Robot head */}
    <rect x="22" y="32" width="56" height="48" rx="12" fill="white" />

    {/* Antenna */}
    <circle cx="50" cy="22" r="6" fill="white" />
    <rect x="47" y="22" width="6" height="14" fill="white" />

    {/* Eyes */}
    <circle cx="36" cy="52" r="8" fill="#2563EB" />
    <circle cx="64" cy="52" r="8" fill="#2563EB" />

    {/* Smile */}
    <path
      d="M35 66 Q50 78 65 66"
      stroke="#2563EB"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />

    {/* Ears */}
    <rect x="12" y="46" width="8" height="20" rx="4" fill="white" />
    <rect x="80" y="46" width="8" height="20" rx="4" fill="white" />
  </svg>
);

export default Logo;
