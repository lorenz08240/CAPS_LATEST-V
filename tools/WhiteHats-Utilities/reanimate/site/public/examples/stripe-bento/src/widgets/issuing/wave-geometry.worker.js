// Builds the folded wave ribbon off the main thread (module worker), like stripe.com's waveGeometry worker.
import { foldedWaveArrays } from "./wave-geometry.js";

self.onmessage = (event) => {
  const result = foldedWaveArrays(event.data);
  self.postMessage(result, [result.positions.buffer, result.uvs.buffer, result.normals.buffer, result.indices.buffer]);
};
