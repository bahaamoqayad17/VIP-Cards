import * as React from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface FieldWrapProps extends React.HTMLAttributes<HTMLDivElement> {
  firstSuffix?: React.ReactNode;
  lastSuffix?: React.ReactNode;
}

function FieldWrap({
  className,
  firstSuffix,
  lastSuffix,
  children,
  ...props
}: FieldWrapProps) {
  return (
    <div
      data-slot="field-wrap"
      className={cn("relative flex items-center", className)}
      {...props}
    >
      {firstSuffix && (
        <div className="absolute left-3 z-10 flex items-center">
          {firstSuffix}
        </div>
      )}
      <div className="flex-1">{children}</div>
      {lastSuffix && (
        <div className="absolute right-3 z-10 flex items-center">
          {lastSuffix}
        </div>
      )}
    </div>
  );
}

function Mounted({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export { FieldWrap, Mounted };
