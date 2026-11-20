// Loads the land mask and generates the globe dots in a worker, cached per image URL. Kept free of
// three.js so it can start before the (large) three.js module graph has loaded: stripe.com starts
// this as soon as the bento section renders, long before the card scrolls into view.
import { generateDots } from "./dots.js";

const DOT_COUNT_DESKTOP = 60000;
const DOT_COUNT_MOBILE = 30000;
const cache = new Map();

export const isCoarsePointer = () => window.matchMedia("(pointer: coarse)").matches && "ontouchstart" in window;

function loadImageData(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      resolve(ctx.getImageData(0, 0, image.width, image.height));
    };
    image.onerror = reject;
    image.src = url;
  });
}

export function precomputeDots(imageUrl) {
  const cached = cache.get(imageUrl);
  if (cached) return cached;
  const promise = loadImageData(imageUrl).then(
    (imageData) =>
      new Promise((resolve) => {
        const params = {
          imageWidth: imageData.width,
          imageHeight: imageData.height,
          imageData: imageData.data,
          dotCount: isCoarsePointer() ? DOT_COUNT_MOBILE : DOT_COUNT_DESKTOP,
          radius: 2,
          poissonJitter: 0.75,
          dotSizeVariation: 0.75,
          dotOpacityVariation: 0.3,
        };
        if (typeof Worker !== "undefined") {
          try {
            const worker = new Worker(new URL("./dots-worker.js", import.meta.url), { type: "module" });
            worker.onmessage = (event) => {
              worker.terminate();
              resolve(event.data);
            };
            worker.onerror = () => {
              worker.terminate();
              resolve(generateDots(params));
            };
            worker.postMessage(params);
            return;
          } catch {}
        }
        resolve(generateDots(params));
      }),
  );
  cache.set(imageUrl, promise);
  return promise;
}
