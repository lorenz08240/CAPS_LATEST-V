import React, { useState, memo } from "react";
import HardwareIcon from "./HardwareIcon";

/**
 * Thumbnail component:
 * 48x48px container with rounded-md and border border-white/10.
 * Centers the hardware image with object-contain.
 * Fallback to clean HardwareIcon SVG (no awkward camera icon text overlay).
 * Floating z-50 popover preview with safe bounding offsets.
 */
export const HoverImagePreview = memo(({
  category,
  imageUrl,
  name,
  brand,
  size = 48,
  previewSize = 160
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasValidImage = Boolean(imageUrl && imageUrl !== "/pcbackground.png" && !imageError);

  return (
    <div
      className="hw-thumb-box"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Preview ${name || category}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* 48x48 Center Image Thumbnail */}
      {hasValidImage ? (
        <img
          src={imageUrl}
          alt={name || "Hardware"}
          className="hw-thumb-img"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className={`hw-fallback-icon hw-thumb-${category || "generic"}`}>
          <HardwareIcon category={category} size={Math.round(size * 0.5)} />
        </div>
      )}

      {/* Popover Preview with z-50 & safe positioning */}
      {isHovered && hasValidImage && (
        <div className="hover-popover-card" style={{ width: `${previewSize}px` }}>
          <div className="hover-popover-media">
            <img
              src={imageUrl}
              alt={name || "Component"}
              className="hover-popover-img"
              loading="lazy"
            />
          </div>
          <div className="hover-popover-caption">
            <span className="popover-brand">{brand || "Hardware"}</span>
            <span className="popover-name" title={name}>
              {name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default HoverImagePreview;
