/**
 * Accessibility utilities for WCAG AAA compliance
 * Handles: High contrast, dyslexic fonts, motion preferences, haptic feedback
 */

import { create } from 'zustand';

export interface AccessibilitySettings {
  highContrast: boolean;
  dyslexicFont: boolean;
  reduceMotion: boolean;
  reduceFlash: boolean;
  hapticFeedback: boolean;
  increasedFontSize: '100' | '125' | '150';
  colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

interface AccessibilityStore extends AccessibilitySettings {
  setHighContrast: (value: boolean) => void;
  setDyslexicFont: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
  setReduceFlash: (value: boolean) => void;
  setHapticFeedback: (value: boolean) => void;
  setFontSize: (size: '100' | '125' | '150') => void;
  setColorblindMode: (mode: AccessibilitySettings['colorblindMode']) => void;
  loadSystemPreferences: () => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  dyslexicFont: false,
  reduceMotion: false,
  reduceFlash: false,
  hapticFeedback: true,
  increasedFontSize: '100',
  colorblindMode: 'none',
};

export const useAccessibilityStore = create<AccessibilityStore>((set, get) => ({
  ...DEFAULT_SETTINGS,

  setHighContrast: (value: boolean) => set({ highContrast: value }),
  setDyslexicFont: (value: boolean) => set({ dyslexicFont: value }),
  setReduceMotion: (value: boolean) => set({ reduceMotion: value }),
  setReduceFlash: (value: boolean) => set({ reduceFlash: value }),
  setHapticFeedback: (value: boolean) => set({ hapticFeedback: value }),
  setFontSize: (size: '100' | '125' | '150') => set({ increasedFontSize: size }),
  setColorblindMode: (mode: AccessibilitySettings['colorblindMode']) => set({ colorblindMode: mode }),

  loadSystemPreferences: () => {
    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    const prefersReducedFlash = window.matchMedia('(prefers-reduced-transparency)').matches;

    set({
      reduceMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      reduceFlash: prefersReducedFlash,
    });
  },

  reset: () => set(DEFAULT_SETTINGS),
}));

/**
 * Apply accessibility CSS classes to document
 */
export function applyAccessibilityClasses(settings: AccessibilitySettings) {
  const root = document.documentElement;

  // High contrast
  if (settings.highContrast) {
    root.classList.add('a11y-high-contrast');
  } else {
    root.classList.remove('a11y-high-contrast');
  }

  // Dyslexic font
  if (settings.dyslexicFont) {
    root.classList.add('a11y-dyslexic-font');
  } else {
    root.classList.remove('a11y-dyslexic-font');
  }

  // Reduce motion
  if (settings.reduceMotion) {
    root.classList.add('a11y-reduce-motion');
  } else {
    root.classList.remove('a11y-reduce-motion');
  }

  // Reduce flash
  if (settings.reduceFlash) {
    root.classList.add('a11y-reduce-flash');
  } else {
    root.classList.remove('a11y-reduce-flash');
  }

  // Font size
  root.style.setProperty('--font-size-multiplier', settings.increasedFontSize + '%');

  // Colorblind filter
  applyColorblindFilter(settings.colorblindMode);
}

/**
 * Apply colorblind simulation filters
 * Uses standard colorblind-friendly color transforms
 */
function applyColorblindFilter(mode: AccessibilitySettings['colorblindMode']) {
  const root = document.documentElement;

  // Remove all existing colorblind classes
  root.classList.remove(
    'a11y-deuteranopia',
    'a11y-protanopia',
    'a11y-tritanopia'
  );

  if (mode !== 'none') {
    root.classList.add(`a11y-${mode}`);
  }
}

/**
 * Haptic feedback utility
 * Provides vibration patterns for different interactions
 */
export function triggerHapticFeedback(
  type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy'
) {
  // Check if settings allow haptic
  const { hapticFeedback } = useAccessibilityStore.getState();
  if (!hapticFeedback) return;

  // Check browser support
  if (!('vibrate' in navigator)) return;

  const patterns: Record<typeof type, number | number[]> = {
    success: [50, 30, 50], // Short feedback
    error: [100, 50, 100], // Longer feedback
    warning: [50, 20, 50, 20, 50], // Multiple pulses
    light: 10,
    medium: 30,
    heavy: 100,
  };

  try {
    navigator.vibrate(patterns[type]);
  } catch {
    // Silently ignore if vibration not supported
  }
}

/**
 * Enhanced audio feedback with spatial awareness
 */
export function playAccessibleSound(
  frequency: number,
  duration: number,
  volume: number = 0.2,
  type: 'sine' | 'square' | 'sawtooth' = 'sine'
) {
  const settings = useAccessibilityStore.getState();
  
  // Skip if flash reduction is enabled and frequency is high-pitched
  if (settings.reduceFlash && frequency > 3000) {
    return;
  }

  try {
    const audioContext =
      new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration / 1000
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch {
    // Silently ignore if audio not supported
  }
}

/**
 * Check if animation should respect prefers-reduced-motion
 */
export function shouldReduceMotion(): boolean {
  return useAccessibilityStore.getState().reduceMotion;
}

/**
 * Get animation duration based on accessibility settings
 */
export function getAnimationDuration(baseDuration: number): number {
  const { reduceMotion } = useAccessibilityStore.getState();
  return reduceMotion ? 0 : baseDuration;
}

/**
 * Ensure text contrast ratio meets WCAG AAA standards (7:1)
 */
export function getAccessibleColor(
  foreground: string,
  background: string,
  minContrast: 7
): boolean {
  // Simplified contrast checker
  // Full implementation would need proper color parsing and luminance calculation
  const fgLume = estimateLuminance(foreground);
  const bgLume = estimateLuminance(background);
  const contrast =
    fgLume > bgLume
      ? (fgLume + 0.05) / (bgLume + 0.05)
      : (bgLume + 0.05) / (fgLume + 0.05);
  return contrast >= minContrast;
}

function estimateLuminance(color: string): number {
  // Quick luminance estimate (0-1 scale)
  // Returns relative luminance for contrast calculation
  const rgb = color.match(/\d+/g);
  if (!rgb || rgb.length < 3) return 0.5;

  const [r, g, b] = rgb.map((c) => {
    const chan = parseInt(c) / 255;
    return chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
