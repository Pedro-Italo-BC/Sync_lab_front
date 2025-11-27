import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`border-b-1 border-b-[var(--gray-200)] py-2 px-2 w-full
                    placeholder-[var(--gray-200)] text-black placeholder:text-[1rem]
                    focus:outline-none focus:border-b-[var(--blue-100)]
                    focus:placeholder-[var(--blue-100)]
                    transition-colors duration-300 ease-in-out ${className ?? ""}`}
      />
    );
  }
);

Input.displayName = "Input";
