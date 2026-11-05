import React, { useState, memo } from "react";
import HardwareIcon from "./HardwareIcon";

/**
 * Thumbnail component:
 * Bounded thumbnail container with strict dimensions & overflow clipping to prevent layout blowout.
 * Centers the hardware image with object-fit: contain.
 * Fallback to clean HardwareIcon SVG if image missing/errored.
 * Floating popover preview with safe positioning on hover.
 */
export const HoverImagePreview = memo(({
  category,
  imageUrl,
  name,
  brand,
  size = 44,
  previewSize = 160
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasValidImage = Boolean(imageUrl && imageUrl !== "/pcbackground.png" && !imageError);

  return (
    <div
      className="hw-thumb-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Preview ${name || category}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`
      }}
    >
      {/* Strictly bounded thumbnail box */}
      <div className="hw-thumb-box">
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
            <HardwareIcon category={category} size={Math.round(size * 0.52)} />
          </div>
        )}
      </div>

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
