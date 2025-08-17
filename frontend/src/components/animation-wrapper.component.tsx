import { forwardRef } from "react";
import { AnimatePresence, AnimatePresenceProps, motion, MotionProps } from "framer-motion";

export type DefaultAnimationWrapperProps = {
  id?: string;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  transition?: MotionProps["transition"];
  exit?: MotionProps["exit"];
  mode?: "sync" | "wait" | "popLayout";
  initialState?: AnimatePresenceProps["initial"] | undefined;
  visible?: boolean;
  tabIndex?: number;
  style?: React.CSSProperties;
};

interface AnimationWrapperProps extends DefaultAnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const AnimationWrapper = forwardRef<HTMLDivElement, AnimationWrapperProps>(
  (
    {
      id,
      children,
      initial = { opacity: 0 },
      animate = { opacity: 1 },
      transition = { duration: 0.3 },
      exit,
      mode = "wait",
      initialState = undefined,
      visible = true,
      tabIndex,
      className,
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    const resolvedExit = (exit ?? initial) as MotionProps["exit"];

    return (
      <AnimatePresence mode={mode} initial={initialState}>
        {visible && (
          <motion.div
            id={id}
            ref={ref}
            initial={initial}
            animate={animate}
            transition={transition}
            exit={resolvedExit}
            className={className}
            style={style}
            onClick={onClick}
            tabIndex={tabIndex}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

export default AnimationWrapper;
