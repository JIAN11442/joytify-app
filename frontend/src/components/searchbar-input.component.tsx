import { forwardRef, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { IconBaseProps } from "react-icons";

import { IconName } from "./react-icons.component";
import InputBox, { InputProps } from "./input-box.component";
import AnimationWrapper, { DefaultAnimationWrapperProps } from "./animation-wrapper.component";
import { timeoutForEventListener } from "../lib/timeout.lib";
import mergeRefs from "../lib/merge-refs.lib";

interface SearchBarProps extends DefaultAnimationWrapperProps, InputProps {
  visible?: boolean;
  icon?: { name: IconName; opts?: IconBaseProps };
  autoCloseFn?: { active: boolean; closeFn: () => void | null };
  tw?: { wrapper?: string; icon?: string };
}

const SearchBarInput = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      id,
      type = "text",
      placeholder,
      autoFocus = true,
      onChange,
      iconHighlight,
      autoCloseFn,
      className,
      visible = false,
      initial,
      animate,
      transition,
      exit,
      mode,
      style: wrapperStyle,
      icon,
      tw,
      ...props
    },
    ref
  ) => {
    const searchBarRef = useRef<HTMLInputElement>(null);

    // handle input onChange
    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    // auto disappear searchbar while click outside
    useEffect(() => {
      const handleOnBlur: EventListener = (e) => {
        if (autoCloseFn) {
          const { active, closeFn } = autoCloseFn;

          if (active && searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
            closeFn();
          }
        }
      };

      return timeoutForEventListener(window, "click", handleOnBlur);
    }, [autoCloseFn, searchBarRef]);

    return (
      <AnimationWrapper
        key={`${id}-wrapper`}
        initial={initial || { width: "0%", opacity: 0 }}
        animate={animate || { width: "100%", opacity: 1 }}
        transition={transition || { duration: 0.5, ease: "easeOut" }}
        exit={exit || { width: "20%", opacity: 0 }}
        visible={visible}
        mode={mode || "wait"}
        style={wrapperStyle}
        className={twMerge(`flex-1`, tw?.wrapper)}
      >
        <InputBox
          ref={mergeRefs(ref, searchBarRef)}
          id={id}
          type={type}
          placeholder={placeholder}
          icon={icon}
          autoFocus={autoFocus}
          onChange={handleInputOnChange}
          iconHighlight={iconHighlight}
          className={twMerge(
            `
            py-3
            border-none
            rounded-md
          `,
            className
          )}
          tw={{ icon: tw?.icon }}
          {...props}
        />
      </AnimationWrapper>
    );
  }
);

export default SearchBarInput;
