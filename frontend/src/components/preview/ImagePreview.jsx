import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

// This component acts as a wrapper for the entire app or a specific page 
// to provide the context for image previews.
// You can also use it to programmatically trigger a preview if needed, 
// but the declarative approach (wrapping items) is often easier.

export const ImagePreviewProvider = ({ children }) => {
  return (
    <PhotoProvider
      maskOpacity={0.9}
      speed={() => 800}
      easing={(type) => (type === 2 ? 'cubic-bezier(0.36, 0, 0.66, -0.56)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)')}
    >
      {children}
    </PhotoProvider>
  );
};

export const PreviewImage = ({ src, children, alt }) => {
    return (
        <PhotoView src={src}>
            {/* The child element is what triggers the preview when clicked */}
            {/* If children is not provided, we render nothing (hidden trigger) or a default thumbnail if needed */}
            {children ? children : <img src={src} alt={alt} style={{ display: 'none' }} />}
        </PhotoView>
    );
};
