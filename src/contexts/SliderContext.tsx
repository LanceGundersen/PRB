import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SliderContextType, SliderState } from '../interfaces';
import { SliderAction } from '../types';

const SliderContext = createContext<SliderContextType | undefined>(undefined);

const initialState: SliderState = {
  price: 50,
  shipping: 50,
  ratings: 50,
};

const sliderReducer = (state: SliderState, action: SliderAction): SliderState => {
  switch (action.type) {
    case 'UPDATE_SLIDER':
      return { ...state, [action.payload.name]: action.payload.value };
    case 'RESET_SLIDERS':
      return { ...initialState };
    default:
      return state;
  }
};

interface SliderProviderProps {
  children: ReactNode;
}

export const SliderProvider: React.FC<SliderProviderProps> = ({ children }) => {
  const [preferences, dispatch] = useReducer(sliderReducer, initialState);

  return (
    <SliderContext.Provider value={{ preferences, dispatch }}>
      {children}
    </SliderContext.Provider>
  );
};

export const useSlider = (): SliderContextType => {
  const context = useContext(SliderContext);
  if (context === undefined) {
    throw new Error('useSlider must be used within a SliderProvider');
  }
  return context;
};
