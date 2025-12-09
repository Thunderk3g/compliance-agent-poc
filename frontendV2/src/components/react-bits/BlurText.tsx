
import { cn } from '@/lib/utils';
import { motion, useInView as useFramerInView, type Variants } from 'framer-motion';
import { useRef } from 'react';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: 'words' | 'letters';
}

export const BlurText = ({ text, className, delay = 0, animateBy = 'words' }: BlurTextProps) => {
  const ref = useRef(null);
  const isInView = useFramerInView(ref, { once: true });
  
  const words = text.split(' ');
  const letters = text.split('');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay },
    },
  };

  const child: Variants = {
    hidden: { filter: 'blur(10px)', opacity: 0, y: 10 },
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
  };

  if (animateBy === 'letters') {
    return (
        <motion.span
            ref={ref}
            className={cn("inline-block", className)}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
        >
            {letters.map((letter, index) => (
                <motion.span key={index} variants={child} className="inline-block relative">
                    {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
            ))}
        </motion.span>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn("flex flex-wrap gap-[0.25em]", className)}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};
