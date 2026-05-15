declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function send(event: string, params: Record<string, string>) {
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

export function trackToolUse(toolId: string, category?: string) {
  send("tool_use", {
    tool_id: toolId,
    ...(category ? { tool_category: category } : {}),
  });
}

export function trackCopyResult(toolId: string) {
  send("copy_result", { tool_id: toolId });
}

export function trackDownload(toolId: string, fileType: string) {
  send("file_download", { tool_id: toolId, file_type: fileType });
}

export function trackBlogToolClick(toolId: string, fromSlug: string) {
  send("blog_tool_click", { tool_id: toolId, from_post: fromSlug });
}

export function trackBlogRead(slug: string, category: string) {
  send("blog_read_complete", { post_slug: slug, post_category: category });
}
