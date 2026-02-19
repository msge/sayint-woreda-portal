import * as React from "react"
import { cn } from "../../lib/utils"

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  const items = React.Children.toArray(children).filter(child => child.type === SelectItem);
  
  const handleSelect = (itemValue) => {
    onValueChange?.(itemValue);
    setOpen(false);
  };
  
  return (
    <div className="relative">
      <div onClick={() => setOpen(!open)}>
        {React.Children.map(children, child => 
          child.type === SelectTrigger ? React.cloneElement(child, { value }) : null
        )}
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 border rounded-md bg-popover shadow-md">
          {items.map(item => React.cloneElement(item, { onSelect: () => handleSelect(item.props.value) }))}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, value, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
    {children || value}
  </div>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }) => placeholder;

const SelectContent = ({ children }) => children;

const SelectItem = React.forwardRef(({ className, children, value, onSelect, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground", className)} onClick={onSelect} {...props}>
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };