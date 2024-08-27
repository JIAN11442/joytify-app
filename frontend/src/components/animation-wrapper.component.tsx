import { AnimatePresence, motion, MotionProps } from "framer-motion";
import { forwardRef } from "react";

interface AnimationWrapperProps {
  children: React.ReactNode;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  transition?: MotionProps["transition"];
  exit?: MotionProps["exit"];
  mode?: "sync" | "wait" | "popLayout";
  visible?: boolean;
  className?: string;
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
      visible = true,
      className,
    },
    ref
  ) => {
    const resolvedExit = (
      exit === undefined ? initial : exit
    ) as MotionProps["exit"];

    return (
      <AnimatePresence mode={mode}>
        {visible && (
          <motion.div
            ref={ref}
            initial={initial}
            animate={animate}
            transition={transition}
            exit={resolvedExit}
            className={className}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

export default AnimationWrapper;
