import React from "react";

const DropdownSelect = ({
  items,
  defaultValue = '',
  onChange,
  selectionText = '',
  style = {},
}) => {
  if (!items) {
    return null;
  }

  return (
    <div>
      <select style={style} value={defaultValue} onChange={onChange}>
        {items.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span>
        {selectionText} {defaultValue}
      </span>
    </div>
  );
};

export default DropdownSelect;
