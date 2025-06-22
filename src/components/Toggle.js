import React, { useEffect, useState } from "react";

const Toggle = ({ onChange, data }) => {
  const [toggleOn, setToggleOn] = useState(false);

  const handleToggle = () => {
    const newToggleState = !toggleOn;
    setToggleOn(newToggleState);
    if (onChange) {
      onChange(newToggleState); // Notify parent about the new state
    }
  };

  useEffect(() => {
    // Set initial toggle state based on `data` prop
    setToggleOn(data);
  }, [data]); // Add `data` to the dependency array to react to changes

  return (
    <div className="toggle-btn flex aic jc">
      <button
        onClick={handleToggle}
        className={`btn button cleanbtn flex aic jc rel anim ${toggleOn ? "on" : ""}`}
      >
        <div className="circle flex aic jc abs anim"></div>
      </button>
    </div>
  );
};

export default Toggle;
