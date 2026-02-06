import { cn } from "@/lib/utils";

interface GreenTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GreenText({ children, className }: GreenTextProps) {
  return (
    <span 
      className={cn(
        "text-primary border-b-2 border-primary",
        className
      )}
    >
      {children}
    </span>
  );
}
