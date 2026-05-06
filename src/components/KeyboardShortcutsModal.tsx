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
          <DialogTitle>단축키 안내</DialogTitle>
          <DialogDescription>
            단축키를 활용하면 크레피카를 더 빠르게 사용할 수 있습니다
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">검색 포커스</span>
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
              /
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">계획 도구로 이동</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">g</kbd>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">p</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">제작 도구로 이동</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">g</kbd>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">c</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">분석 도구로 이동</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">g</kbd>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">a</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">SNS 도구로 이동</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">g</kbd>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">s</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">도움말 토글</span>
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
              ?
            </kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
