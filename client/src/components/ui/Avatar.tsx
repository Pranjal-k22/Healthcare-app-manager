import React, { useEffect, useMemo, useState } from 'react';

export interface AvatarProps {
  name?: string;
  src?: string | null;
  seed?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

type AvatarStage = 'photo' | 'dicebear' | 'initials';

export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  src,
  seed,
  size = 'md',
  className = '',
  style,
}) => {
  const getInitials = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const initials = getInitials(name);

  // Generate DiceBear URL ONLY when an explicit non-sensitive seed is supplied (prevents PII leakage)
  const dicebearUrl = useMemo(() => {
    if (!seed || !seed.trim()) return null;

    return (
      'https://api.dicebear.com/10.x/avataaars/svg' +
      `?seed=${encodeURIComponent(seed.trim())}` +
      '&backgroundColor=b1e2ff,dbeafe,e0f2fe' +
      '&borderRadius=50'
    );
  }, [seed]);

  const getInitialStage = (): AvatarStage => {
    if (src && src.trim()) return 'photo';
    if (dicebearUrl) return 'dicebear';
    return 'initials';
  };

  const [stage, setStage] = useState<AvatarStage>(getInitialStage);

  // Reset stage state whenever src or seed change to avoid stuck error states
  useEffect(() => {
    setStage(getInitialStage());
  }, [src, dicebearUrl]);

  const handleImageError = () => {
    if (stage === 'photo' && dicebearUrl) {
      setStage('dicebear');
    } else {
      setStage('initials');
    }
  };

  const imageSrc =
    stage === 'photo'
      ? src || null
      : stage === 'dicebear'
        ? dicebearUrl
        : null;

  return (
    <div
      className={`avatar-ui avatar-size-${size} ${className}`}
      style={style}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`${name} profile`}
          className="avatar-img"
          onError={handleImageError}
        />
      ) : (
        <span className="avatar-initials" aria-hidden="true">
          {initials}
        </span>
      )}
    </div>
  );
};

export default Avatar;
