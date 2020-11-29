import * as React from 'react';

export const Neoporezivi = ({ onChange, onToggle, title, description, amount, disabled }: any) => (
  <label>
    <input type="checkbox" checked={!disabled} onChange={(e) => onToggle(e.target.checked)} />
    <span>{title}</span>
    <input
      type="number"
      step={25}
      value={amount}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
    <small>{description}</small>
  </label>
);
