import React from "react";
import Slider from "@mui/material/Slider";

const minDistance = 1;

function valuetext(value) {
  return `${value}°C`;
}

const SankeySlider = ({ value, setValue, min, max }) => {
  const [value1, setValue1] = [value, setValue];

  const handleChange1 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    if (activeThumb === 0) {
      setValue1([Math.min(newValue[0], value1[1] - minDistance), value1[1]]);
    } else {
      setValue1([value1[0], Math.max(newValue[1], value1[0] + minDistance)]);
    }
  };

  return (
    <Slider
      getAriaLabel={() => "Minimum distance"}
      value={value1}
      onChange={handleChange1}
      valueLabelDisplay="auto"
      getAriaValueText={valuetext}
      disableSwap
      max={max}
      min={min}
    />
  );
};

export default SankeySlider;
