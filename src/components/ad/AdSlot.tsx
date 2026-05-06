import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export type AdSlotType = 'top' | 'bottom' | 'loading' | 'download';
export type AdStrategy = 'instant' | 'process_heavy' | 'download_focused';

interface AdSlotProps {
  type: AdSlotType;
  strategy: AdStrategy;
  isProcessing?: boolean;
  className?: string;
  slotId?: string;
}

const AD_CLIENT = "ca-pub-3050601904412736";

const FORMAT: Record<AdSlotType, string> = {
  top: 'horizontal',
  bottom: 'auto',
  loading: 'rectangle',
  download: 'auto',
};

const MIN_HEIGHT: Record<AdSlotType, string> = {
  top: 'min-h-[90px]',
  bottom: 'min-h-[100px]',
  loading: 'min-h-[200px]',
  download: 'min-h-[100px]',
};

export function AdSlot({ type, strategy, isProcessing, className, slotId }: AdSlotProps) {
  const pushed = useRef(false);

  const visible =
    type === 'top' ||
    (type === 'loading' && strategy === 'process_heavy' && isProcessing) ||
    (type === 'download' && strategy === 'download_focused') ||
    (type === 'bottom' && strategy !== 'download_focused');

  useEffect(() => {
    if (!visible || pushed.current) return;
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // adsense not ready
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={cn("w-full overflow-hidden", MIN_HEIGHT[type], className)}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slotId ?? ""}
        data-ad-format={FORMAT[type]}
        data-full-width-responsive="true"
      />
    </div>
  );
}
