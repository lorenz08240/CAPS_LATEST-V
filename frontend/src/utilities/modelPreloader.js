import { useGLTF } from '@react-three/drei';

export const SSD_MODEL_URL = '/assets/models/M2_NVME_SSD.glb';
export const RAM_MODEL_URL = '/assets/models/random_access_memory_ram_ddr4.glb';

/**
 * Deferred preloader for DDR4 RAM model during idle time.
 * Avoids main-thread freezing at module evaluation or initial mount.
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

/**
 * Deferred preloader for M.2 NVMe SSD 27.8MB model during idle time.
 * Never runs synchronously during page render to eliminate frame hitches.
 */
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
