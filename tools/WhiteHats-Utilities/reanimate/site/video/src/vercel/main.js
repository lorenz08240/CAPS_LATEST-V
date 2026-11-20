// The Vercel video: six clones from vercel.com, nextjs.org and turborepo.com, each next to its original,
// then all six at once and the install command. Same stage and renderer as the demo video:
//   bun video/scripts/render.ts --page vercel.html
// Scenes (times in shots.js):
//   frame  the rules and crosses everything sits in, and the shot counter
//   pairs  one shot per clone: the original and the copy side by side, or wiped across each other
//   grid   all six copies at once
//   end    "/reanimate" and the install command
import { start } from "../stage.js";
import { DURATION } from "./shots.js";
import * as frame from "./frame.js";
import * as pairs from "./pairs.js";
import * as grid from "./grid.js";
import * as end from "./end.js";

document.getElementById("stage").classList.add("v");
start({
  scenes: [frame, pairs, grid, end],
  duration: DURATION,
  fonts: ["560 46px Geist", "600 132px Geist", "400 20px 'Geist Mono'"],
});
