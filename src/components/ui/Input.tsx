import { useState, type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

const cn = (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(" ");

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, type = "text", className = "", containerClassName = "", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && <label htmlFor={id} className="text-sm font-semibold text-gray-700">{label}</label>}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3 text-gray-400 pointer-events-none">{leftIcon}</div>}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={cn(
              "w-full px-4 py-3 border rounded-lg transition-all outline-none text-gray-900 placeholder:text-gray-400",
              "focus:ring-2 focus:ring-green-500/20 focus:border-[#4CAF50]",
              error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200",
              leftIcon ? "pl-10" : "pl-4",
              (rightIcon || isPassword) ? "pr-10" : "pr-4",
              className
            )}
            {...props}
          />
          <div className="absolute right-3 flex items-center">
            {isPassword ? (
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 focus:outline-none">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            ) : rightIcon && <div className="text-gray-400">{rightIcon}</div>}
          </div>
        </div>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;