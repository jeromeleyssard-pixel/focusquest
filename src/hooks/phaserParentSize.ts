/**
 * Mesure la zone disponible pour le canvas Phaser afin d'éviter le débordement
 * hors viewport (souvent causé par flex sans min-height: 0).
 */
export function measurePhaserParent(parent: HTMLElement): { width: number; height: number } {
  const rect = parent.getBoundingClientRect();
  const vh = typeof window !== 'undefined' ? window.visualViewport?.height ?? window.innerHeight : rect.height;
  const vw = typeof window !== 'undefined' ? window.innerWidth : rect.width;

  const w = Math.max(320, Math.floor(rect.width > 0 ? rect.width : vw));

  let h = Math.floor(rect.height);
  if (h < 120) {
    const remaining = Math.max(240, Math.floor(vh - rect.top - 12));
    h = remaining;
  }
  const maxFromViewport = Math.max(240, Math.floor(vh - rect.top - 8));
  h = Math.min(h, maxFromViewport);

  return { width: w, height: Math.max(240, h) };
}
