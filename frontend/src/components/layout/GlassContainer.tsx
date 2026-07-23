import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassContainerProps extends HTMLMotionProps<"div"> {
  className?: string;
  children: React.ReactNode;
}

export function GlassContainer({ className, children, ...props }: GlassContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn("glass-panel", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
