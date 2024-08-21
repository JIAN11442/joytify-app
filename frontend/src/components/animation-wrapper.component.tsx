import { AnimatePresence, motion, MotionProps } from "framer-motion";

interface AnimationWrapperProps {
  children: React.ReactNode;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  transition?: MotionProps["transition"];
  exit?: MotionProps["exit"];
  mode?: "sync" | "wait" | "popLayout";
  ref?: React.RefObject<HTMLDivElement>;
  visible?: boolean;
  className?: string;
}

const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 0.5 },
  exit = { opacity: 0 },
  mode = "wait",
  ref,
  visible = true,
  className,
}) => {
  return (
    <AnimatePresence mode={mode}>
      {visible && (
        <motion.div
          ref={ref}
          initial={initial}
          animate={animate}
          transition={transition}
          exit={exit}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimationWrapper;
