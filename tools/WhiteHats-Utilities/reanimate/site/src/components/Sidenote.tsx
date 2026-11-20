import type { ReactNode } from "react";

// Numbered margin note: sits in the right-hand column on wide screens, under the text on narrow ones.
export function Sidenote({ n, children }: { n: number; children: ReactNode }) {
  return (
    <>
      <sup className="sn-ref">{n}</sup>
      <span className="sidenote" data-n={n} role="note">
        {children}
      </span>
    </>
  );
}
