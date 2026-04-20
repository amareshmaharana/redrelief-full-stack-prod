import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

function renderAsterisks(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    if (!node.includes("*")) {
      return node;
    }

    return node.split("*").flatMap((part, index, allParts) => {
      const last = index === allParts.length - 1;
      if (last) {
        return [part];
      }

      return [
        part,
        <span key={`required-mark-${index}`} className="text-destructive" aria-hidden="true">
          *
        </span>,
      ];
    });
  }

  if (Array.isArray(node)) {
    return node.map((item, index) => <React.Fragment key={index}>{renderAsterisks(item)}</React.Fragment>);
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    if (!element.props.children) {
      return element;
    }

    return React.cloneElement(element, {
      children: renderAsterisks(element.props.children),
    });
  }

  return node;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & { requiredMark?: boolean }
>(({ className, children, requiredMark, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props}>
    {renderAsterisks(children)}
    {requiredMark ? (
      <span className="ml-1 text-destructive" aria-hidden="true">
        *
      </span>
    ) : null}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
