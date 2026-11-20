import { CompareVideo } from "@/components/CompareVideo";
import { CopyCommand } from "@/components/CopyCommand";
import { LiveCard } from "@/components/LiveCard";
import { Nav, type NavItem } from "@/components/Nav";
import { Sidenote } from "@/components/Sidenote";
import { examples, media, type Example } from "@/examples";

const REPO = "https://github.com/NiazMorshed2007/reanimate";
const INSTALL = "npx skills add NiazMorshed2007/reanimate -g";

const sections: NavItem[] = [
  { id: "how", label: "How it works" },
  { id: "use", label: "Using it" },
  { id: "close", label: "How close" },
  { id: "limits", label: "Limits" },
  { id: "examples", label: "Examples" },
];

const steps: [string, string][] = [
  ["Record.", "It films the original in a real browser, at a fixed size and frame rate, and collects every animation the page declares."],
  ["Write it down.", "One row per moving part: when it starts, how long it takes, how far it goes, on which curve."],
  ["Rebuild.", "In your code, with what the project already uses: CSS, Framer Motion, GSAP, three.js."],
  ["Compare.", "It films the copy the same way and compares timing, easing and pixels."],
  ["Repeat.", "It fixes the biggest difference and films again, usually two to five rounds. Whatever still doesn’t match is listed in its report."],
];

const prompts: [string, React.ReactNode][] = [
  ["From a site", <>the hero entrance on https://example.com, into components/Hero.tsx</>],
  ["From a video", <>this loader, 0:03 to 0:05 of ~/Downloads/loader.mov</>],
  ["Pixel-exact", <>the card hover in this gif, <code>match it exactly</code></>],
  ["Add your own", <>the logo marquee on https://example.com, <code>with our logos and pause on hover</code></>],
];

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="section">
      <div className="section__head">
        <h2>{title}</h2>
        <span className="num serif">{String(n).padStart(2, "0")}</span>
      </div>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: [string, React.ReactNode, React.ReactNode?][] }) {
  return (
    <table className="kv">
      <tbody>
        {rows.map(([k, v, num]) => (
          <tr key={k}>
            <th scope="row">{k}</th>
            <td>{v}</td>
            {num !== undefined && <td className="num">{num}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// What an example does and how close it came, kept out of the way: shown on hovering or focusing "details".
function Details({ e }: { e: Example }) {
  const id = `${e.slug}-details`;
  return (
    <div className="tip">
      <button type="button" className="tip__btn" aria-describedby={id}>
        details
      </button>
      <div role="tooltip" id={id} className="tip__box">
        <p>{e.about}</p>
        {e.note && <p className="tip__note">{e.note}</p>}
        <dl className="tip__rows">
          {e.results.map(([k, how, num]) => (
            <div key={k}>
              <dt>
                {k} <span>{how}</span>
              </dt>
              <dd>{num}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="page" id="top">
      <Nav items={sections} />

      <main className="main">
        <header className="masthead">
          <h1>
            reanimate <span>· a skill for Claude Code</span>
          </h1>
          <div className="masthead__links">
            <a href={REPO}>GitHub</a>
          </div>
        </header>

        <p className="lede">
          Point Claude at an animation you like on another site, and it rebuilds it in your code for you to build on.
        </p>

        <CopyCommand command={INSTALL} />
        <p className="hint">
          Then, in Claude Code, type <code>/reanimate</code> and say what you want. <a href="#use">How to ask ↓</a>
        </p>

        <div className="meta">
          <span>/reanimate</span>
          <span><a href="#examples">{examples.length} live examples ↓</a></span>
          <span>by <a href="https://github.com/NiazMorshed2007">Niaz</a></span>
        </div>

        <p>
          A lot of good ideas start on someone else’s site. Ask an agent to rebuild one from a link or a screenshot and it makes one pass, calls it done, and misses. It can’t see the motion or tell how far off it is.
        </p>
        <p>
          reanimate records the original, rebuilds it in your code, then records the copy the same way and compares the two. Each round shows what’s still off, so the agent keeps going until the numbers match. You end up with a close starting point to make your own.
        </p>

        <figure className="figure">
          <CompareVideo src={media("stripe-bento", "compare.mp4")} width={560} height={634} label="Three cards loading on stripe.com, and below them the copy doing the same" />
          <figcaption className="figure__caption">
            <span>Top: stripe.com. Bottom: the copy, recorded the same way.</span>
          </figcaption>
        </figure>

        <p>
          Three cards from the stripe.com homepage, rebuilt by the skill, one agent per card. You can try each one live in the <a href="#examples">examples</a> at the end of the page.
          <Sidenote n={1}>Each took its agent 28 to 40 minutes, from the first recording to the final report.</Sidenote>
        </p>

        <Section id="how" n={1} title="How it works">
          <p>Each rebuild runs the same loop.</p>
          <ol className="steps">
            {steps.map(([title, body], i) => (
              <li key={title}>
                <span className="steps__n">{String(i + 1).padStart(2, "0")}</span>
                <p><b>{title}</b> {body}</p>
              </li>
            ))}
          </ol>
          <p>
            For canvas and WebGL it also records what the page sends to the GPU: shaders, uniforms and the three.js scene. The page runs on a clock the skill steps frame by frame, so two recordings come out the same.
            <Sidenote n={2}>Random particles included: it seeds the page’s random numbers too.</Sidenote>
          </p>
          <figure className="figure figure--sheet">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sheet" src={media("stripe-issuing", "sheet.webp")} alt="A comparison sheet: the card issuing hover on stripe.com, in the copy, and in red the pixels that differ. Only thin outlines of the card's edge and the title differ." width={816} height={975} loading="lazy" />
            <figcaption className="figure__caption">
              <span>Each round produces a sheet like this: the original, the copy, and in red the pixels that differ.</span>
            </figcaption>
          </figure>
        </Section>

        <Section id="use" n={2} title="Using it">
          <p>In Claude Code, say what you want, where it is and where it should go:</p>
          <div className="prompts">
            {prompts.map(([label, text]) => (
              <div key={label}>
                <span className="prompt__label">{label}</span>
                <span className="prompt__text"><span className="slash">/reanimate</span> {text}</span>
              </div>
            ))}
          </div>
          <p>
            It runs on <a href="https://bun.sh">Bun</a>, on macOS or Linux. The first run downloads Chromium and ffmpeg, about 250 MB. No API keys. When you install it, the <a href="https://skills.sh">skills CLI</a> asks which agents to set up; add <code>-a claude-code</code> to skip that.
            <Sidenote n={3}>Other agents that read SKILL.md can install it too, but it has only been tested with Claude Code.</Sidenote>
          </p>
        </Section>

        <Section id="close" n={3} title="How close">
          <p>By default it matches the motion and leaves the look to you. Ask for more or less:</p>
          <Rows
            rows={[
              ["Moves the same", <>The default. Same trigger, order and timing, within 80 ms, the same kind of easing and distance. Text, colours and fonts can be yours.</>],
              ["Looks the same", <>Say <em>match it exactly</em>. Fonts, sizes, colours and spacing too, with at most 2 % of pixels off.</>],
              ["Yours on top", <>Say <em>clone this and add…</em> The cloned parts match; your additions stay separate.</>],
            ]}
          />
        </Section>

        <Section id="limits" n={4} title="Limits">
          <ul className="list">
            <li>Pages behind a login, YouTube and Loom can’t be recorded directly. Hand it a screen recording.</li>
            <li>Physics springs are fitted from how they overshoot and settle, not read from the source.</li>
            <li>Web workers are traced, but their clocks run in real time. A canvas inside an iframe needs the iframe’s own URL.</li>
            <li>It copies what you point it at. Fonts, images and code still belong to their owners.</li>
          </ul>
        </Section>

        <Section id="examples" n={5} title="Examples">
          <p>
            The copies that react to you run live in the page: hover them, or on a phone tap or scroll to them, and drag any file onto the vercel.com triangle. The clerk.com copies use the free Geist font, so only their lettering
            differs. For the others, the original plays on the left or on top, and the copy next to it or below.
          </p>
          <nav className="strip" aria-label="Examples">
            {examples.map((e) => (
              <a key={e.slug} href={`#${e.slug}`} title={e.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media(e.slug, "poster.webp")} alt={e.title} />
              </a>
            ))}
          </nav>
          {examples.map((e) => (
            <div key={e.slug} id={e.slug} className="example">
              <div className="example__head">
                <h3>
                  {e.title} <span>from <a href={e.source.url}>{e.source.name}</a></span>
                </h3>
                <Details e={e} />
              </div>
              {e.show.kind === "video" && (e.show.stacked || e.show.height > e.show.width) ? (
                // the two takes are stacked
                <figure className="figure">
                  <CompareVideo src={media(e.slug, "compare.mp4")} width={e.show.width} height={e.show.height} label={`${e.title}: ${e.source.name} on top, the copy below`} />
                  <figcaption className="figure__caption">
                    <span>{e.source.name} on top, the copy below</span>
                    <a href={e.live} target="_blank" rel="noreferrer">try it live ↗</a>
                  </figcaption>
                </figure>
              ) : e.show.kind === "video" ? (
                <figure className="figure">
                  <CompareVideo src={media(e.slug, "compare.mp4")} width={e.show.width} height={e.show.height} label={`${e.title}: ${e.source.name} on the left, the copy on the right`} />
                  <figcaption className="figure__caption figure__caption--pair">
                    <span>{e.source.name}</span>
                    <span>the copy · <a href={e.live} target="_blank" rel="noreferrer">try it live ↗</a></span>
                  </figcaption>
                </figure>
              ) : (
                <figure className="figure">
                  <LiveCard src={`${e.live}&embed`} width={e.show.width} height={e.show.height} background={e.show.background} label={`${e.title}, the copy, running live`} />
                  <figcaption className="figure__caption">
                    <span>
                      the copy, <span className="on-hover">{e.show.try ?? "hover it"}</span>
                      <span className="on-touch">tap it</span> ·{" "}
                      <a href={e.live} target="_blank" rel="noreferrer">
                        open on its own ↗
                      </a>
                    </span>
                    <a href={e.source.url} target="_blank" rel="noreferrer">
                      the original on {e.source.name} ↗
                    </a>
                  </figcaption>
                </figure>
              )}
            </div>
          ))}
        </Section>

        <footer className="footer">
          <span>
            <a href={REPO}>GitHub</a> · MIT licence · built with reanimate
          </span>
          <span>
            The examples recreate parts of vercel.com, nextjs.org, turborepo.com, stripe.com, workos.com, clerk.com, liveblocks.io, resend.com and pro.reactbits.dev as a study of the technique. Not affiliated with or endorsed by
            Vercel, Stripe, WorkOS, Clerk, Liveblocks, Resend or React Bits. All trademarks belong to their owners.
          </span>
        </footer>
      </main>
    </div>
  );
}
