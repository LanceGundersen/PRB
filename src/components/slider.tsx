import React from 'react';
import { SliderProps } from '../interfaces';

const Slider: React.FC<SliderProps> = ({ label, min, max, value, step, name, onChange }) => {
  return (
    <div className="mb-4">
      <div className="label font-semibold">
        <span className="label-text">{label}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className="range range-xs range-primary"
        step={step}
        name={name}
        onChange={onChange}
      />
      <div className="w-full flex justify-between text-xs px-2">
        <span>Little</span>
        <span>Somewhat</span>
        <span>A lot</span>
      </div>
    </div>
  );
};

export default Slider;
