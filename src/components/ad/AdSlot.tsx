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
    // Only push when a real slotId is provided (manual ad unit).
    // Auto-ads are served by the adsbygoogle.js script alone — no push needed.
    if (!visible || pushed.current || !slotId) return;
    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // adsense not ready
    }
  }, [visible, slotId]);

  if (!visible) return null;

  // No slotId: render a spacing container for auto-ads natural placement.
  if (!slotId) {
    return (
      <div
        className={cn("w-full", MIN_HEIGHT[type], className)}
        aria-hidden="true"
        data-ad-placeholder={type}
      />
    );
  }

  // Manual ad unit with explicit slotId
  return (
    <div className={cn("w-full overflow-hidden", MIN_HEIGHT[type], className)}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={FORMAT[type]}
        data-full-width-responsive="true"
      />
    </div>
  );
}
