import { SliderState } from "./interfaces";

export type SourceInfo = {
  id: number,
  apiIdentifier: string;
  displayName: string;
};

export type SliderAction =
  | { type: 'UPDATE_SLIDER'; payload: { name: keyof SliderState; value: number } }
  | { type: 'RESET_SLIDERS' };