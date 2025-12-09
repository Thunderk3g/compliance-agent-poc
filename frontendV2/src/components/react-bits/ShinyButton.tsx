
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const ShinyButton = ({ children, className, variant = 'primary', ...props }: ShinyButtonProps) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden group";
  
  const variants = {
    primary: "bg-primary text-white shadow-lg hover:shadow-primary/40",
    secondary: "bg-white text-text-main hover:bg-surface-50 shadow-md border border-surface-200",
    outline: "bg-transparent text-white border border-white/20 hover:bg-white/10"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 justify-center">{children}</span>
      
      {/* Sheen Effect */}
      <span className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-shine" />
    </motion.button>
  );
};
