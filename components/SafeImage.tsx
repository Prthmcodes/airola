import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  // Optional WebP candidates; the browser picks the best size and falls back to src (JPG/PNG).
  webpSrcSet?: string;
}

// <img> that swaps itself for a brand-green gradient block of the same size if the file fails to load.
const SafeImage: React.FC<SafeImageProps> = ({ className = '', style, alt, onError, webpSrcSet, sizes, ...rest }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={`${className} bg-gradient-to-br from-[#2D6E5F] to-[#3D8D7A]`} aria-hidden="true" />;
  }

  const img = (
    <img
      {...rest}
      sizes={sizes}
      alt={alt}
      className={className}
      style={style}
      onError={e => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );

  // display: contents keeps <picture> out of the layout, so the <img> sizes exactly as before.
  return webpSrcSet ? (
    <picture className="contents">
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      {img}
    </picture>
  ) : img;
};

export default SafeImage;
