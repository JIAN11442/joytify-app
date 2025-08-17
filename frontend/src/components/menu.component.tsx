import { twMerge } from "tailwind-merge";
import { MotionProps } from "framer-motion";
import React, { forwardRef, useEffect, useRef } from "react";
import AnimationWrapper from "./animation-wrapper.component";
import { timeoutForEventListener } from "../lib/timeout.lib";
import mergeRefs from "../lib/merge-refs.lib";

type MenuProps = {
  id?: string;
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
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
};

const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ id, activeState, wrapper, style, className, children }, ref) => {
    const menuRef = useRef<HTMLDivElement | null>(null);

    const transformOrigin = wrapper?.transformOrigin ?? "top right";
    const duration = wrapper?.duration ?? 0.2;

    // auto close user menu
    useEffect(() => {
      const el = menuRef.current;
      const { visible, setVisible } = activeState;

      if (!visible || !el) return;

      const handleOnBlur: EventListener = (e) => {
        const target = e.target as Node;

        // if click outside of menu, close menu
        if (el && !el.contains(target)) {
          setVisible(false);
        }
        // if not click outside of menu, check...
        else {
          const menuItem = (target as HTMLElement).closest("[data-menu-item]");

          // if check inside of menu, and click on menu item, close menu
          if (menuItem) {
            setVisible(false);
          }
          // if not click on menu item, do nothing
          else {
            return;
          }
        }
      };

      return timeoutForEventListener(document, "click", handleOnBlur);
    }, [menuRef, activeState]);

    return (
      <AnimationWrapper
        id={id}
        ref={mergeRefs(menuRef, ref)}
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
        style={style}
        className={twMerge(
          `
            absolute
            flex
            flex-col
            w-[200px]
            p-1
            border
            bg-neutral-900
            border-neutral-700/50
            shadow-[0_0_10px_0_rgba(0,0,0,0.1)]
            rounded-md
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
