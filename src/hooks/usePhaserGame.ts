import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

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

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1024,
      height: 768,
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

    return () => {
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
  parentId: string
): Promise<T> {
  return new Promise((_resolve, reject) => {
    const parent = document.getElementById(parentId);
    if (!parent) {
      reject(new Error(`Parent element "${parentId}" not found`));
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1024,
      height: 768,
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

    new Phaser.Game(config);

    // For now, resolve immediately - scenes handle their own completion
    // In a full implementation, scenes would emit events to resolve the promise
    _resolve(null as unknown as T);
  });
}
