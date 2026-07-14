import { ThemeComposition } from '../../types/themes';
import { Scene } from '../../types';
import { AstronautCharacter } from '../composition/themes/characters/AstronautCharacter';
import { SpaceSuitOutfit } from '../composition/themes/outfits/SpaceSuitOutfit';
import { MarsEnvironment } from '../composition/themes/environments/MarsEnvironment';
import { NeonStyle } from '../composition/themes/styles/NeonStyle';

export class VisualDirector {
  
  public getThemeComposition(scene: Scene): ThemeComposition {
    // For proof-of-concept, we are rendering an Astronaut on Mars 
    // with the clean Neon/Whiteboard style!
    return {
      character: new AstronautCharacter(),
      outfit: new SpaceSuitOutfit(),
      environment: new MarsEnvironment(),
      style: new NeonStyle(),
    };
  }
}
