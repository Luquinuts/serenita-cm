import { useState } from "react";

type ToggleSwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
};

export function ToggleSwitch({
  checked: controlledChecked,
  defaultChecked,
  onChange,
  disabled = false,
  label,
  id,
}: ToggleSwitchProps) {
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  function handleToggle() {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      handleToggle();
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className="toggle-switch"
      id={id}
    >
      <span className="toggle-switch-track">
        <span className="toggle-switch-thumb" />
      </span>
      {label ? (
        <span className="toggle-switch-label">{label}</span>
      ) : null}
    </button>
  );
}
