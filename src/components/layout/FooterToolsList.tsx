import { Link } from "react-router-dom";
import { TOOLS_CONFIG } from "@/data/tools-config";

export function FooterToolsList() {
  return (
    <ul className="space-y-2 text-sm">
      {TOOLS_CONFIG.map((tool) => (
        <li key={tool.id}>
          <Link
            to={tool.path}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {tool.titleKo}
          </Link>
        </li>
      ))}
    </ul>
  );
}
