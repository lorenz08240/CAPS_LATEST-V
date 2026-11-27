import { useGLTF } from '@react-three/drei';

export const RAM_MODEL_URL = '/assets/models/random_access_memory_ram_ddr4.glb';
export const SSD_MODEL_URL = '/assets/models/M2_NVME_SSD.glb';
export const PSU_MODEL_URL = '/models/Basic_PSU.glb';

/**
 * 3D Model Asset Manifest with verified byte weights for hero scene preloading.
 * Total size ~33.6 MB (SSD is ~27.8MB, RAM is ~4.3MB, PSU is ~1.4MB).
 */
export const PRELOAD_MODELS = [
  { id: 'ram', name: 'DDR4 RAM', url: RAM_MODEL_URL, size: 4329848 },
  { id: 'ssd', name: 'M.2 NVMe SSD', url: SSD_MODEL_URL, size: 27841924 },
  { id: 'psu', name: 'Basic PSU', url: PSU_MODEL_URL, size: 1441188 },
];

export const TOTAL_PRELOAD_BYTES = PRELOAD_MODELS.reduce((acc, m) => acc + m.size, 0);

// Module-level singleton state
let preloadingPromise = null;
let isAllPreloaded = false;
let currentProgress = 0;
const subscribers = new Set();

function notifySubscribers(progressData) {
  currentProgress = Math.max(currentProgress, progressData.percent);
  subscribers.forEach((cb) => {
    try {
      cb(progressData);
    } catch (e) {
      console.warn('[modelPreloader] Subscriber notification error:', e);
    }
  });
}

/**
 * Fetches an individual model via ReadableStream or XMLHttpRequest,
 * reporting incremental byte progress, then preloads it into useGLTF cache.
 */
async function fetchAndCacheModel(model, onChunk) {
  try {
    const response = await fetch(model.url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${model.url}`);
    }

    const headerLength = response.headers.get('content-length');
    const contentLength = headerLength ? parseInt(headerLength, 10) : model.size;

    if (!response.body || !response.body.getReader) {
      // Fallback for environments lacking ReadableStream
      await response.blob();
      onChunk(model.id, contentLength, contentLength);
    } else {
      const reader = response.body.getReader();
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          loaded += value.byteLength || value.length;
          onChunk(model.id, loaded, contentLength);
        }
      }
      onChunk(model.id, contentLength, contentLength);
    }

    // Populate Three.js / @react-three/drei GLTF memory cache
    try {
      useGLTF.preload(model.url);
    } catch (gltfErr) {
      console.warn(`[modelPreloader] useGLTF.preload notice for ${model.name}:`, gltfErr);
    }
  } catch (err) {
    console.warn(`[modelPreloader] Network load notice for ${model.name}:`, err);
    // Mark as complete with expected size so overall progress can complete
    onChunk(model.id, model.size, model.size);
    try {
      useGLTF.preload(model.url);
    } catch {}
  }
}

/**
 * Preload all 3D hero models with real progress tracking (0% to 100%).
 * Dispatches 'buildlab:all-models-ready' upon completion.
 *
 * @param {Function} [onProgress] Callback receiving { percent, loadedBytes, totalBytes, activeModel, isComplete }
 * @returns {Promise<{ success: boolean }>}
 */
export function preloadAllModels(onProgress) {
  if (typeof window === 'undefined') {
    return Promise.resolve({ success: true });
  }

  if (typeof onProgress === 'function') {
    subscribers.add(onProgress);
  }

  // If already loaded and cached, immediately report 100% completion
  if (isAllPreloaded || window.__BUILDLAB_ALL_MODELS_READY__) {
    const readyState = {
      percent: 100,
      loadedBytes: TOTAL_PRELOAD_BYTES,
      totalBytes: TOTAL_PRELOAD_BYTES,
      activeModel: 'Ready',
      isComplete: true,
    };
    if (typeof onProgress === 'function') {
      onProgress(readyState);
    }
    return Promise.resolve({ success: true });
  }

  // If preloading is already in progress, hook into the active promise
  if (preloadingPromise) {
    if (typeof onProgress === 'function') {
      onProgress({
        percent: currentProgress,
        loadedBytes: Math.round((currentProgress / 100) * TOTAL_PRELOAD_BYTES),
        totalBytes: TOTAL_PRELOAD_BYTES,
        activeModel: 'Loading...',
        isComplete: false,
      });
    }
    return preloadingPromise;
  }

  const loadedMap = {};
  const totalMap = {};
  PRELOAD_MODELS.forEach((m) => {
    loadedMap[m.id] = 0;
    totalMap[m.id] = m.size;
  });

  preloadingPromise = new Promise((resolve) => {
    let completedCount = 0;

    const handleChunk = (modelId, loadedBytes, totalBytes) => {
      loadedMap[modelId] = loadedBytes;
      if (totalBytes > 0) {
        totalMap[modelId] = totalBytes;
      }

      const currentLoaded = Object.values(loadedMap).reduce((a, b) => a + b, 0);
      const currentTotal = Object.values(totalMap).reduce((a, b) => a + b, 0);
      const activeModelObj = PRELOAD_MODELS.find((m) => m.id === modelId);

      const calculatedPercent = currentTotal > 0
        ? Math.min(100, Math.max(0, Math.round((currentLoaded / currentTotal) * 100)))
        : 100;

      notifySubscribers({
        percent: calculatedPercent,
        loadedBytes: currentLoaded,
        totalBytes: currentTotal,
        activeModel: activeModelObj?.name || '3D Asset',
        isComplete: false,
      });
    };

    const modelPromises = PRELOAD_MODELS.map((model) =>
      fetchAndCacheModel(model, (id, loaded, total) => {
        handleChunk(id, loaded, total);
      }).then(() => {
        completedCount++;
      })
    );

    Promise.all(modelPromises).then(() => {
      isAllPreloaded = true;
      currentProgress = 100;

      if (typeof window !== 'undefined') {
        window.__BUILDLAB_ALL_MODELS_READY__ = true;
        window.dispatchEvent(
          new CustomEvent('buildlab:all-models-ready', {
            detail: {
              models: PRELOAD_MODELS.map((m) => m.name),
              totalBytes: TOTAL_PRELOAD_BYTES,
              timestamp: Date.now(),
            },
          })
        );
      }

      notifySubscribers({
        percent: 100,
        loadedBytes: TOTAL_PRELOAD_BYTES,
        totalBytes: TOTAL_PRELOAD_BYTES,
        activeModel: 'All Models Ready',
        isComplete: true,
      });

      resolve({ success: true });
    });
  });

  return preloadingPromise;
}

/**
 * Convenience helper to subscribe to preloader progress.
 * Returns an unsubscribe callback.
 */
export function startModelPreloading(onProgress) {
  if (typeof onProgress === 'function') {
    subscribers.add(onProgress);
  }
  preloadAllModels(onProgress);
  return () => {
    if (typeof onProgress === 'function') {
      subscribers.delete(onProgress);
    }
  };
}

/**
 * Backwards-compatible single-model preloader functions.
 */
export function preloadRAMModel(priority = 'idle') {
  if (typeof window === 'undefined') return;
  const trigger = () => {
    try {
      useGLTF.preload(RAM_MODEL_URL);
    } catch (e) {
      console.warn('RAM model preload notice:', e);
    }
  };

  if (priority === 'immediate') {
    trigger();
  } else if ('requestIdleCallback' in window) {
    window.requestIdleCallback(trigger, { timeout: 2000 });
  } else {
    setTimeout(trigger, 500);
  }
}

export function preloadNVMeSSDModel(priority = 'idle') {
  if (typeof window === 'undefined') return;
  const trigger = () => {
    try {
      useGLTF.preload(SSD_MODEL_URL);
    } catch (e) {
      console.warn('Deferred SSD model preload notice:', e);
    }
  };

  if (priority === 'immediate') {
    trigger();
  } else if ('requestIdleCallback' in window) {
    window.requestIdleCallback(trigger, { timeout: 2000 });
  } else {
    setTimeout(trigger, 600);
  }
}

export function preloadPSUModel(priority = 'idle') {
  if (typeof window === 'undefined') return;
  const trigger = () => {
    try {
      useGLTF.preload(PSU_MODEL_URL);
    } catch (e) {
      console.warn('Deferred PSU model preload notice:', e);
    }
  };

  if (priority === 'immediate') {
    trigger();
  } else if ('requestIdleCallback' in window) {
    window.requestIdleCallback(trigger, { timeout: 2000 });
  } else {
    setTimeout(trigger, 700);
  }
}
