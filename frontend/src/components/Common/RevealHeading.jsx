import React, { useEffect, useRef, useState } from "react";
import "./RevealHeading.css";

/**
 * Scroll-triggered heading reveal.
 *
 * Purpose (antislop R-19): mark the major section headline as it enters view,
 * so the reader knows where a new section begins. One reveal per heading,
 * no loop, no parallax, no spring.
 *
 * `parts` keeps accent spans intact, e.g.
 *   [{ text: "MEET THE " }, { text: "DEVELOPERS", className: "title-accent" }]
 */
export default function RevealHeading({
  as: Tag = "h2",
  parts,
  text,
  className = "",
  underline = false,
  ...rest
}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const segments = [];
  const source = parts || [{ text: text || "" }];
  source.forEach((part, partIndex) => {
    part.text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word, wordIndex) => {
        segments.push({
          word,
          className: part.className || "",
          key: `${partIndex}-${wordIndex}`,
        });
      });
  });

  return (
    <Tag
      ref={ref}
      className={`reveal-heading ${revealed ? "is-revealed" : ""} ${className}`.trim()}
      {...rest}
    >
      <span className="reveal-words">
        {segments.map((segment, index) => (
          <React.Fragment key={segment.key}>
            <span
              className={`reveal-word ${segment.className}`.trim()}
              style={{ "--word-index": index }}
            >
              {segment.word}
            </span>
            {index < segments.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
      {underline && (
        <span
          className="reveal-heading__underline"
          style={{ "--word-count": segments.length }}
          aria-hidden="true"
        />
      )}
    </Tag>
  );
}
