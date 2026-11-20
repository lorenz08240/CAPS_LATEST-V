import React, { useEffect, useRef, useState } from "react";
import "./AnimatedHeading.css";

/**
 * Line-by-line heading reveal.
 *
 * Purpose (R-19): mark a major headline as it enters view, one line at a time,
 * so the type reads as a deliberate sequence instead of a block fading in.
 * One pass, no loop, no spring.
 */
export default function AnimatedHeading({
  as: Tag = "h2",
  lines = [],
  className = "",
  underlineClassName = "",
  underline = true,
  ...rest
}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || revealed) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed]);

  return (
    <Tag
      ref={ref}
      className={`animated-heading ${revealed ? "is-revealed" : ""} ${className}`.trim()}
      {...rest}
    >
      <span className="animated-heading__body">
        {lines.map((line, index) => (
          <span
            className="animated-heading__line"
            key={index}
            style={{ "--line-index": index }}
          >
            <span className="animated-heading__line-inner">{line}</span>
          </span>
        ))}
      </span>
      {underline && (
        <span
          className={`animated-heading__underline ${underlineClassName}`.trim()}
          style={{ "--line-count": lines.length }}
          aria-hidden="true"
        />
      )}
    </Tag>
  );
}
