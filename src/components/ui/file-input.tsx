import * as React from "react";
import { cn } from "@/lib/utils";

export interface FileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="file"
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium file:mr-2 file:px-2 file:py-1 file:rounded placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
FileInput.displayName = "FileInput";

export { FileInput };
