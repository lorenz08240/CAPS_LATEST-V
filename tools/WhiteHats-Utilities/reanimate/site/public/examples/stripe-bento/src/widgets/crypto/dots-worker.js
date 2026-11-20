// Generates the globe dots off the main thread, like stripe.com does.
import { generateDots, transferables } from "./dots.js";

self.onmessage = (event) => {
  const dots = generateDots(event.data);
  self.postMessage(dots, transferables(dots));
};
