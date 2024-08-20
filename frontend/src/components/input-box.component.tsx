import { forwardRef, useState } from "react";
import Icon from "./react-icons.component";
import { IconType } from "react-icons";
import { IoEye, IoEyeOff } from "react-icons/io5";

type InputBoxProps = {
  id: string;
  type: React.HTMLInputTypeAttribute;
  name: string;
  value?: string;
  placeholder: string;
  icon: IconType;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  (
    {
      id,
      type,
      name,
      value,
      placeholder,
      icon,
      disabled,
      onChange,
      onBlur,
      onKeyDown,
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // switch password visibility
    const handleSwitchPasswordVisibility = (
      e: React.MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();

      const timeout = setTimeout(() => {
        setIsPasswordVisible(!isPasswordVisible);
      }, 0);

      return () => clearTimeout(timeout);
    };

    return (
      <div className="relative">
        {/* input */}
        <input
          id={id}
          ref={ref}
          type={
            type === "password"
              ? isPasswordVisible
                ? "text"
                : "password"
              : type
          }
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={`input-box`}
        />

        {/* input icon */}
        <Icon
          name={icon}
          className={`
            input-left-icon
            ${value?.length && "text-green-custom/80"}
          `}
        />

        {/* password visible icon */}
        <>
          {type === "password" && (
            <button
              onClick={handleSwitchPasswordVisibility}
              className={`
                input-right-icon
                hover:text-grey-custom
                transition
              `}
            >
              <Icon name={isPasswordVisible ? IoEyeOff : IoEye} />
            </button>
          )}
        </>
      </div>
    );
  }
);

export default InputBox;
