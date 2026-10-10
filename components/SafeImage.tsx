import React, { useState } from 'react';

// <img> that swaps itself for a brand-green gradient block of the same size if the file fails to load.
const SafeImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = '', style, alt, onError, ...rest }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={`${className} bg-gradient-to-br from-[#2D6E5F] to-[#3D8D7A]`} aria-hidden="true" />;
  }

  return (
    <img
      {...rest}
      alt={alt}
      className={className}
      style={style}
      onError={e => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
};

export default SafeImage;
