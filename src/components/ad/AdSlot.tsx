import { cn } from "@/lib/utils";

interface AdSlotProps {
  type: 'top' | 'bottom' | 'loading' | 'download';
  className?: string;
}

const AD_SLOT_CONFIG = {
  top: {
    label: 'Top Ad Slot',
    height: 'h-24',
  },
  bottom: {
    label: 'Bottom Ad Slot',
    height: 'h-32',
  },
  loading: {
    label: 'Processing Ad',
    height: 'h-48',
  },
  download: {
    label: 'Download Ad Slot',
    height: 'h-28',
  },
};

export function AdSlot({ type, className }: AdSlotProps) {
  const config = AD_SLOT_CONFIG[type];

  return (
    <div
      className={cn(
        "w-full rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/20",
        config.height,
        className
      )}
      role="complementary"
      aria-label={`Advertisement: ${config.label}`}
    >
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">{config.label}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">AdSense Placeholder</p>
      </div>
    </div>
  );
}
