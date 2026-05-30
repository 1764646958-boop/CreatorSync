import { createDefaultTargetConfig, normalizeTargetConfig } from './config.js';

const STORAGE_KEY = 'creatorsync.targetConfig.v1';

export const loadTargetConfig = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createDefaultTargetConfig();
  }

  try {
    const rawConfig = window.localStorage.getItem(STORAGE_KEY);

    if (!rawConfig) {
      return createDefaultTargetConfig();
    }

    return normalizeTargetConfig(JSON.parse(rawConfig));
  } catch {
    return createDefaultTargetConfig();
  }
};

export const saveTargetConfig = (targetConfig) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeTargetConfig(targetConfig)));
  } catch {
    // Local storage may be full or blocked. Keep the page interactive and let in-memory state continue.
  }
};

export const resetTargetConfig = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return createDefaultTargetConfig();
};
