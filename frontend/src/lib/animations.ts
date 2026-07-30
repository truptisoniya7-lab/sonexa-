// Shared Framer Motion animation variants to keep the UI consistent and reduce bundle/code duplication

export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const slowSpring = {
  type: "spring",
  stiffness: 200,
  damping: 30,
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 15 },
  transition: springTransition
};

export const scaleUp = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: springTransition
};

export const hoverCard = {
  whileHover: { y: -4, scale: 1.02, transition: springTransition },
  whileTap: { scale: 0.98 }
};

export const hoverButton = {
  whileHover: { scale: 1.05, transition: springTransition },
  whileTap: { scale: 0.95 }
};
