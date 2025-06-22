import React, { useState } from "react";

function CheckboxList({ checkboxes, onChange }) {
  const [checkedItems, setCheckedItems] = useState([]);

  const handleCheckboxChange = (value) => {
    const newCheckedItems = checkedItems.includes(value)
      ? checkedItems.filter(item => item !== value) // Remove if already checked
      : [...checkedItems, value]; // Add if not checked

    setCheckedItems(newCheckedItems);
    onChange(newCheckedItems); // Return the updated list of checked items
  };

  return (
    <div className="chart-options flex aic">
      {checkboxes.map(({ label, color, value }) => (
        <div key={value} className="chart-item flex aic">
          <input
            type="checkbox"
            className="checkbox"
            checked={checkedItems.includes(value)}
            onChange={() => handleCheckboxChange(value)}
            style={{ accentColor: color }} // Set checkbox color
          />
          <div className="lbl">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default CheckboxList;
