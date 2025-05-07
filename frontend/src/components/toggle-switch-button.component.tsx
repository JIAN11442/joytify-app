import { useState, useId, forwardRef } from "react";

type Size = {
  width?: number;
  height?: number;
};

interface ToggleSwitchButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  track?: { size: Size };
  thumb?: { size: Size };
  padding?: number;
}

const ToggleSwitchButton = forwardRef<HTMLInputElement, ToggleSwitchButtonProps>(
  (
    {
      checked,
      defaultChecked = false,
      onChange,
      disabled = false,
      name,
      id,
      value,
      track,
      thumb,
      padding = 2,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    // controlled mode: use 'checked' prop if provided.
    // uncontrolled mode: use internalChecked state if 'checked' is undefined.
    const isControlled = typeof checked === "boolean";
    const isChecked = isControlled ? checked : internalChecked;

    const defaultTrackHeight = 30;
    const autoResizeThumbSize = (trackHeight: number) => trackHeight - padding * 2;

    const trackWidth = track?.size?.width ?? 60;
    const trackHeight = track?.size?.height ?? defaultTrackHeight;
    const thumbWidth = thumb?.size?.width ?? autoResizeThumbSize(trackHeight);
    const thumbHeight = thumb?.size?.height ?? autoResizeThumbSize(trackHeight);
    const slideDistance = trackWidth - thumbWidth - padding;

    const handleToggle = () => {
      if (disabled) return;
      const nextState = !isChecked;

      // if uncontrolled,
      // update the internal state to reflect the new value
      if (!isControlled) {
        setInternalChecked(nextState);
      }

      // always notify the parent component of the new state.
      // the event object mimics a native input event, so the parent can access the new value via e.target.checked.
      const fakeEvent = {
        target: {
          checked: nextState,
          name,
          value,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange?.(fakeEvent);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleToggle();
      }
    };

    return (
      <>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          tabIndex={-1}
          readOnly
          className="sr-only"
          {...props}
        />

        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          tabIndex={0}
          style={{ width: trackWidth, height: trackHeight }}
          className={`
            relative
            inline-flex
            shrink-0
            items-center
            justify-start
            ${isChecked ? "bg-green-500" : "bg-neutral-700"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            rounded-full
            transition-colors
            duration-300
          `}
        >
          <span
            style={{
              width: thumbWidth,
              height: thumbHeight,
              transform: `translateX(${isChecked ? slideDistance : padding}px)`,
            }}
            className={`
              inline-block
              bg-white
              rounded-full
              transition-transform
              duration-300
            `}
          />
        </button>
      </>
    );
  }
);

export default ToggleSwitchButton;
