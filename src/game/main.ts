import { Boot } from './scenes/Boot';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { HomeScene } from './scenes/HomeScene';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#1A1A2E',
  scene: [Boot, Preloader, HomeScene],
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
