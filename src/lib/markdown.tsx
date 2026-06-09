import React from 'react';
import { Link } from 'react-router-dom';

function processInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let i = 0;
  let buf = '';

  const flush = () => {
    if (buf) { parts.push(buf); buf = ''; }
  };

  while (i < text.length) {
    // Bold **text**
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        flush();
        parts.push(<strong key={i}>{text.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    // Italic *text* (single)
    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        flush();
        parts.push(<em key={i}>{text.slice(i + 1, end)}</em>);
        i = end + 1;
        continue;
      }
    }
    // Link [text](url)
    if (text[i] === '[') {
      const cb = text.indexOf(']', i);
      if (cb !== -1 && text[cb + 1] === '(') {
        const cp = text.indexOf(')', cb + 2);
        if (cp !== -1) {
          flush();
          const linkText = text.slice(i + 1, cb);
          const url = text.slice(cb + 2, cp);
          const isExt = url.startsWith('http');
          parts.push(
            isExt
              ? <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:text-primary/80">{linkText}</a>
              : <Link key={i} to={url} className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:text-primary/80">{linkText}</Link>
          );
          i = cp + 1;
          continue;
        }
      }
    }
    buf += text[i];
    i++;
  }
  flush();

  if (parts.length === 1 && typeof parts[0] === 'string') return parts[0];
  return <>{parts}</>;
}

export function MarkdownContent({ content, className = '' }: { content: string; className?: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={i} className="h-3" />);
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">{processInline(trimmed.slice(4))}</h3>);
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-foreground">{processInline(trimmed.slice(3))}</h2>);
      i++;
      continue;
    }

    // Unordered list block
    if (trimmed.startsWith('- ')) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        const txt = lines[i].trim().slice(2);
        items.push(<li key={i} className="mb-2 pl-1 marker:text-cyan-300">{processInline(txt)}</li>);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="mb-5 ml-5 list-disc space-y-1 text-base leading-8 text-foreground/90">
          {items}
        </ul>
      );
      continue;
    }

    // Ordered list block
    if (/^\d+\.\s/.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const txt = lines[i].trim().replace(/^\d+\.\s/, '');
        items.push(<li key={i} className="mb-2 pl-1 marker:text-amber-300">{processInline(txt)}</li>);
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="mb-5 ml-5 list-decimal space-y-1 text-base leading-8 text-foreground/90">
          {items}
        </ol>
      );
      continue;
    }

    elements.push(
      <p key={i} className="mb-5 text-base leading-8 text-foreground/90">
        {processInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
