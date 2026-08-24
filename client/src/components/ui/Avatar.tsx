import React, { useState } from 'react';

export interface AvatarProps {
  name?: string;
  src?: string;
  seed?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  src,
  seed,
  size = 'md',
  className = '',
  style,
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Deterministic DiceBear Avataaars SVG fallback with HealthPulse palette (blue/teal stops & 50% circle)
  const effectiveSeed = seed || name;
  const dicebearUrl = `https://api.dicebear.com/10.x/avataaars/svg?seed=${encodeURIComponent(effectiveSeed)}&backgroundColor=b1e2ff,dbeafe,e0f2fe&borderRadius=50`;

  const avatarSrc = src || (effectiveSeed ? dicebearUrl : undefined);

  return (
    <div className={`avatar-ui avatar-size-${size} ${className}`} style={style}>
      {avatarSrc && !imgError ? (
        <img
          src={avatarSrc}
          alt={name}
          className="avatar-img"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
