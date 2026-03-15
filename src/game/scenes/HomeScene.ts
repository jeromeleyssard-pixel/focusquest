import { Scene } from 'phaser';

/**
 * Scène d'accueil minimale — affichée au démarrage de Phaser.
 * L'UI principale (sélection âge, menu) est gérée par React.
 */
export class HomeScene extends Scene {
  constructor() {
    super('HomeScene');
  }

  create() {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'FocusQuest', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }
}
