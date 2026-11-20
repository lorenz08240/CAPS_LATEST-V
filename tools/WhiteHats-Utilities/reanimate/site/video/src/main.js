// The demo video: a 1920x1080 stage drawn from the time alone. Scenes, in order, with the bars of the
// timing grid they sit on (90 bpm, bar n starts at 2.166 + n * 2.667 s):
//
//   intro     0 – 6.2     "/reanimate", the prompts on a picker wheel, one a beat (to bar 1.5); later the
//                         header above "how it works"
//   showcase  6.2 – 15.5  the clones, big, one every two beats (bars 1.5–5)
//   helix    15.4 – 25    the Resend cube up close, the camera pulls back to all 18 in a mosaic (bar 5.5),
//                         which winds into a turning helix (bars 6.5–7.75)
//   how      23.5 – 39.5  record, spec, build, verify, repeat (bars 8–14; how.js keeps its own clock)
//   install  39.2 – end   the install command (bars 14.25–17)
import { DURATION } from "./lib.js";
import { start } from "./stage.js";
import * as intro from "./intro.js";
import * as showcase from "./showcase.js";
import * as helix from "./helix.js";
import * as how from "./how.js";
import * as install from "./install.js";

start({
  scenes: [intro, showcase, helix, how, install],
  duration: DURATION,
  fonts: ["600 100px Inter", "400 20px Inter", "400 20px 'JetBrains Mono'", "italic 400 20px 'Instrument Serif'"],
});
