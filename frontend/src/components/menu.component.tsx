import { twMerge } from "tailwind-merge";
import React, { forwardRef, MutableRefObject, useEffect } from "react";
import AnimationWrapper from "./animation-wrapper.component";
import { timeoutForEventListener } from "../lib/timeout.lib";
import { MotionProps } from "framer-motion";

type MenuProps = {
  activeState: {
    visible: boolean;
    setVisible: (state: boolean) => void;
  };
  wrapper?: {
    initial?: MotionProps["initial"];
    animate?: MotionProps["animate"];
    transformOrigin?: string;
    duration?: number;
  };
  className?: string;
  children: React.ReactNode;
};

const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ activeState, wrapper, className, children }, ref) => {
    const menuRef = ref as MutableRefObject<HTMLDivElement | null>;

    const transformOrigin = wrapper?.transformOrigin ?? "top right";
    const duration = wrapper?.duration ?? 0.2;

    // auto close user menu
    useEffect(() => {
      const handleOnBlur: EventListener = (e) => {
        if (menuRef?.current && !menuRef.current.contains(e.target as Node)) {
          activeState.setVisible(false);
        } else {
          activeState.setVisible(false);
        }
      };

      return timeoutForEventListener(document, "click", handleOnBlur);
    }, [menuRef]);

    return (
      <AnimationWrapper
        ref={menuRef}
        visible={activeState.visible}
        initial={
          wrapper?.initial || {
            opacity: 0,
            scale: "0%",
            transformOrigin: transformOrigin,
          }
        }
        animate={
          wrapper?.animate || {
            opacity: 1,
            scale: "100%",
            transformOrigin: transformOrigin,
          }
        }
        transition={{ duration: duration }}
        className={twMerge(
          `
           absolute
            p-1
            bg-neutral-900
            border
            border-neutral-700/50
            flex
            flex-col
            w-[200px]
            rounded-md
            shadow-lg
            z-10
          `,
          className
        )}
      >
        {children}
      </AnimationWrapper>
    );
  }
);

export default Menu;
