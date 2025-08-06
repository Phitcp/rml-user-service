import { CharacterConfigInterface } from "./interfaces/character.interface";

export const characterConfig = (): { character: CharacterConfigInterface } => ({
  character: {
    DEFAULT_EXP_REQUIRED: +(process.env.DEFAULT_EXP_REQUIRED ?? 200),
    DEFAULT_CHARACTER_TITLE: process.env.DEFAULT_CHARACTER_TITLE ?? ''
  },
});
