"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type, label, error, success, hint, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const hasError = !!error;
    const hasSuccess = !!success;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              hasError &&
                "border-destructive focus-visible:ring-destructive pr-10",
              hasSuccess &&
                "border-green-500 focus-visible:ring-green-500 pr-10",
              !hasError && !hasSuccess && "border-input focus-visible:ring-ring",
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            {...props}
          />
          {hasError && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
          )}
          {hasSuccess && !hasError && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-destructive flex items-center gap-1"
          >
            {error}
          </p>
        )}
        {success && !error && (
          <p className="text-sm text-green-500 flex items-center gap-1">
            {success}
          </p>
        )}
        {hint && !error && !success && (
          <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";

export { FormInput };
