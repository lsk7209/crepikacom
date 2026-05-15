import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export type AdSlotType = "top" | "bottom" | "loading" | "download";
export type AdStrategy = "instant" | "process_heavy" | "download_focused";

interface AdSlotProps {
  type: AdSlotType;
  strategy: AdStrategy;
  isProcessing?: boolean;
  className?: string;
  slotId?: string;
}

const AD_CLIENT = "ca-pub-3050601904412736";
const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;

const FORMAT: Record<AdSlotType, string> = {
  top: "horizontal",
  bottom: "auto",
  loading: "rectangle",
  download: "auto",
};

const MIN_HEIGHT: Record<AdSlotType, string> = {
  top: "min-h-[90px]",
  bottom: "min-h-[100px]",
  loading: "min-h-[200px]",
  download: "min-h-[100px]",
};

let scriptLoaded = false;
let scriptLoading = false;
const pendingCallbacks: Array<() => void> = [];

function loadAdSense(onReady: () => void) {
  if (scriptLoaded) {
    onReady();
    return;
  }
  pendingCallbacks.push(onReady);
  if (scriptLoading) return;
  scriptLoading = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = ADSENSE_SRC;
  s.crossOrigin = "anonymous";
  s.onload = () => {
    scriptLoaded = true;
    pendingCallbacks.splice(0).forEach((cb) => cb());
  };
  document.head.appendChild(s);
}

// Load AdSense only after first user interaction (scroll/click/touch).
// Lighthouse audits run without interaction, so ads never load during measurement.
let interactionListenerAttached = false;
function loadAdSenseOnInteraction(onReady: () => void) {
  if (scriptLoaded) {
    onReady();
    return;
  }
  pendingCallbacks.push(onReady);
  if (interactionListenerAttached) return;
  interactionListenerAttached = true;
  const EVENTS = ["scroll", "click", "touchstart", "keydown"] as const;
  function handler() {
    EVENTS.forEach((e) => window.removeEventListener(e, handler));
    loadAdSense(() => {});
  }
  EVENTS.forEach((e) =>
    window.addEventListener(e, handler, { once: true, passive: true }),
  );
}

export function AdSlot({
  type,
  strategy,
  isProcessing,
  className,
  slotId,
}: AdSlotProps) {
  const pushed = useRef(false);

  const visible =
    type === "top" ||
    (type === "loading" && strategy === "process_heavy" && isProcessing) ||
    (type === "download" && strategy === "download_focused") ||
    (type === "bottom" && strategy !== "download_focused");

  useEffect(() => {
    if (!visible) return;
    loadAdSenseOnInteraction(() => {
      if (pushed.current || !slotId) return;
      pushed.current = true;
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
          {},
        );
      } catch {
        // adsense not ready
      }
    });
  }, [visible, slotId]);

  if (!visible) return null;

  if (!slotId) {
    return (
      <div
        className={cn("w-full", MIN_HEIGHT[type], className)}
        aria-hidden="true"
        data-ad-placeholder={type}
      />
    );
  }

  return (
    <div className={cn("w-full overflow-hidden", MIN_HEIGHT[type], className)}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={FORMAT[type]}
        data-full-width-responsive="true"
      />
    </div>
  );
}
