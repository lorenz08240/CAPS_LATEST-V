import React, { useState } from "react";
import HardwareIcon from "./HardwareIcon";

/**
 * Renders a lightweight HardwareIcon thumbnail and only loads the external
 * CDN image on hover inside a floating glass tooltip.
 * Completely eliminates image decoding and memory thrashing on low-end systems.
 */
export const HoverImagePreview = ({
  category,
  imageUrl,
  name,
  brand,
  size = 36,
  previewSize = 140
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasValidImage = imageUrl && imageUrl !== "/pcbackground.png" && !imageError;

  return (
    <div
      className="hover-image-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageLoaded(false);
      }}
      title={`Hover to preview ${name || category}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Default Lightweight Vector SVG Thumbnail */}
      <div className={`hw-thumb-icon-box hw-thumb-${category || "generic"}`}>
        <HardwareIcon category={category} size={Math.round(size * 0.58)} />
      </div>

      {/* Lazy Floating Popover Tooltip (ONLY mounted & fetched on user hover) */}
      {isHovered && hasValidImage && (
        <div className="hover-popover-card" style={{ width: `${previewSize}px` }}>
          <div className="hover-popover-media">
            {!imageLoaded && (
              <div className="hover-popover-spinner">
                <span className="spinner-dot"></span>
              </div>
            )}
            <img
              src={imageUrl}
              alt={name || "Component"}
              className={`hover-popover-img ${imageLoaded ? "loaded" : "loading"}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>
          <div className="hover-popover-caption">
            <span className="popover-brand">{brand || "Hardware"}</span>
            <span className="popover-name">{name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoverImagePreview;
