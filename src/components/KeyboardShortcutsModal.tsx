import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Navigate CrePic faster with these shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Focus search</span>
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
              /
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Go to Plan tools</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">g</kbd>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">p</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Go to Create tools</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">g</kbd>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">c</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Go to Analyze tools</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">g</kbd>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">a</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Toggle this help</span>
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
              ?
            </kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
