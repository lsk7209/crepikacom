import { cn } from "@/lib/utils";

export type AdSlotType = 'top' | 'bottom' | 'loading' | 'download';
export type AdStrategy = 'instant' | 'process_heavy' | 'download_focused';

interface AdSlotProps {
  type: AdSlotType;
  strategy: AdStrategy;
  isProcessing?: boolean;
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

export function AdSlot({ type, strategy, isProcessing, className }: AdSlotProps) {
  const config = AD_SLOT_CONFIG[type];

  // Strategy-based display rules
  const shouldDisplay = () => {
    // Top slot: Always display
    if (type === 'top') return true;

    // Loading slot: Only for process_heavy when processing
    if (type === 'loading') {
      return strategy === 'process_heavy' && isProcessing === true;
    }

    // Download slot: Only for download_focused
    if (type === 'download') {
      return strategy === 'download_focused';
    }

    // Bottom slot: For instant and non-download-focused strategies
    if (type === 'bottom') {
      return strategy !== 'download_focused';
    }

    return true;
  };

  if (!shouldDisplay()) return null;

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
      <div className="text-center px-4">
        <p className="text-sm font-medium text-muted-foreground">{config.label}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">AdSense Placeholder</p>
      </div>
    </div>
  );
}
