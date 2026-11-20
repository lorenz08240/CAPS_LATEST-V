// Mounts the stars in .fading-stars with the preview's props. Reduced-motion users get a still frame,
// as on pro.reactbits.dev. window.fadingStars.restart() mounts them again from the first frame (the
// captures use it to start both pages at the same moment).

import { createFadingStars } from "./fading-stars.js";

const root = document.querySelector(".fading-stars");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
let stars = createFadingStars(root, { reduced: motion.matches });
motion.addEventListener("change", () => stars?.sync({ reduced: motion.matches }));

window.fadingStars = {
  burst: () => stars?.burst(),
  restart() {
    stars?.destroy();
    stars = createFadingStars(root, { reduced: motion.matches });
  },
};
