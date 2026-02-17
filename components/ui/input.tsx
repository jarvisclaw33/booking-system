import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 ${className || ''}`}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
