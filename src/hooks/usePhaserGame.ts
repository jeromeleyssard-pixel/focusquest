import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { EventBus } from '../game/EventBus';
import { PHASER_EXPERIMENT_FINISHED } from '../game/scenes/BaseTrialScene';
import { measurePhaserParent } from './phaserParentSize';

export interface PhaserGameConfig {
  parentId: string;
  sceneKey: string;
  width?: number;
  height?: number;
  config?: Phaser.Types.Core.GameConfig;
}

export function usePhaserGame(
  sceneClass: typeof Phaser.Scene,
  parentId: string,
  onReady?: (game: Phaser.Game) => void
): {
  game: Phaser.Game | null;
  isReady: boolean;
} {
  const gameRef = useRef<Phaser.Game | null>(null);
  const isReadyRef = useRef(false);

  useEffect(() => {
    if (gameRef.current) {
      return; // Already initialized
    }

    const parent = document.getElementById(parentId);
    if (!parent) {
      console.error(`Parent element with id "${parentId}" not found`);
      return;
    }

    let resizeObserver: ResizeObserver | null = null;
    let onResize: (() => void) | null = null;

    const startGame = () => {
      const { width, height } = measurePhaserParent(parent);

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width,
        height,
        parent: parentId,
        backgroundColor: '#1A1A2E',
        scene: sceneClass,
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      gameRef.current = new Phaser.Game(config);
      isReadyRef.current = true;

      if (onReady) {
        onReady(gameRef.current);
      }

      const applySize = () => {
        if (!gameRef.current) return;
        const next = measurePhaserParent(parent);
        if (next.width > 0 && next.height > 0) {
          gameRef.current.scale.resize(next.width, next.height);
        }
      };

      resizeObserver = new ResizeObserver(() => applySize());
      resizeObserver.observe(parent);
      onResize = () => applySize();
      window.addEventListener('resize', onResize);
      window.visualViewport?.addEventListener('resize', onResize);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(startGame);
    });

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (onResize) {
        window.removeEventListener('resize', onResize);
        window.visualViewport?.removeEventListener('resize', onResize);
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        isReadyRef.current = false;
      }
    };
  }, [parentId, sceneClass, onReady]);

  return {
    game: gameRef.current,
    isReady: isReadyRef.current,
  };
}

/**
 * Utility to run a Phaser scene and wait for completion
 */
export async function runPhaserScene<T>(
  sceneClass: typeof Phaser.Scene,
  parentId: string,
  options?: { signal?: AbortSignal }
): Promise<T> {
  return new Promise((resolve, reject) => {
    const parent = document.getElementById(parentId);
    if (!parent) {
      reject(new Error(`Parent element "${parentId}" not found`));
      return;
    }

    let game: Phaser.Game | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let onResize: (() => void) | null = null;

    const cleanup = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (onResize && typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize);
        window.visualViewport?.removeEventListener('resize', onResize);
        onResize = null;
      }
    };

    const handler = (payload: { results?: unknown; moduleId?: string }) => {
      if (!payload || payload.results == null) return;
      EventBus.off(PHASER_EXPERIMENT_FINISHED, handler);
      cleanup();
      game?.destroy(true);
      game = null;
      resolve(payload.results as T);
    };

    EventBus.on(PHASER_EXPERIMENT_FINISHED, handler);

    const applySize = () => {
      if (!game) return;
      const { width, height } = measurePhaserParent(parent);
      if (width > 0 && height > 0) {
        game.scale.resize(width, height);
      }
    };

    const startGame = () => {
      const { width, height } = measurePhaserParent(parent);

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width,
        height,
        parent: parentId,
        backgroundColor: '#1A1A2E',
        scene: sceneClass,
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      game = new Phaser.Game(config);

      resizeObserver = new ResizeObserver(() => {
        applySize();
      });
      resizeObserver.observe(parent);

      onResize = () => applySize();
      window.addEventListener('resize', onResize);
      window.visualViewport?.addEventListener('resize', onResize);
    };

    const runStart = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(startGame);
      });
    };
    runStart();

    if (options?.signal) {
      const onAbort = () => {
        EventBus.off(PHASER_EXPERIMENT_FINISHED, handler);
        cleanup();
        game?.destroy(true);
        game = null;
        reject(new Error('aborted'));
      };
      if (options.signal.aborted) onAbort();
      else options.signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}
