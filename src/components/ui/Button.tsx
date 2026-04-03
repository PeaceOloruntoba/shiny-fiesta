import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  isLoading?: boolean;
}

const cn = (...classes: (string | undefined | boolean)[]) => 
  classes.filter(Boolean).join(" ");

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-gradient-to-b from-brand to-brand-dark text-white hover:opacity-90 shadow-sm",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    danger: "bg-[#D32F2F] text-white hover:bg-red-700 shadow-sm",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
  };

  const baseStyles = "flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all active:scale-[0.98]";
  
  const disabledStyles = "disabled:opacity-60 disabled:cursor-not-allowed disabled:grayscale-[0.5]";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], disabledStyles, className)}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-5">
            <div className="w-5 h-5 border-2 border-gray-200/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-5 h-5 border-2 border-t-[#4CAF50] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <span className="opacity-80 text-sm">Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}