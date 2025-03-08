import { forwardRef } from "react";
import {
  AnimatePresence,
  AnimatePresenceProps,
  motion,
  MotionProps,
} from "framer-motion";

export type DefaultAnimationWrapperProps = {
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  transition?: MotionProps["transition"];
  exit?: MotionProps["exit"];
  mode?: "sync" | "wait" | "popLayout";
  initialState?: AnimatePresenceProps["initial"] | undefined;
  visible?: boolean;
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
      children,
      initial = { opacity: 0 },
      animate = { opacity: 1 },
      transition = { duration: 0.5 },
      exit,
      mode = "wait",
      initialState = undefined,
      visible = true,
      className,
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    const resolvedExit = (
      exit === undefined ? initial : exit
    ) as MotionProps["exit"];

    return (
      <AnimatePresence mode={mode} initial={initialState}>
        {visible && (
          <motion.div
            ref={ref}
            initial={initial}
            animate={animate}
            transition={transition}
            exit={resolvedExit}
            className={className}
            style={style}
            onClick={onClick}
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
