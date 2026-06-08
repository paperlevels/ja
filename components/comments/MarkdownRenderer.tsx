"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-muted-foreground/10 hover:bg-muted-foreground/20 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="コードをコピー"
    >
      {copied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none text-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all transition-colors"
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-2 border-primary bg-muted/40 py-1 pr-3 pl-4 italic text-muted-foreground rounded-r-lg my-3"
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              {...props}
              className="list-disc pl-5 space-y-1 my-3 marker:text-muted-foreground"
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              {...props}
              className="list-decimal pl-5 space-y-1 my-3 marker:text-muted-foreground"
            />
          ),
          li: ({ node, ...props }) => <li {...props} className="pl-1" />,
          hr: ({ node, ...props }) => (
            <hr {...props} className="my-4 border-border" />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-auto my-3">
              <table {...props} className="w-full border-collapse text-sm" />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead {...props} className="bg-muted" />
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="border border-border px-3 py-2 text-left font-semibold text-foreground"
            />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border border-border px-3 py-2" />
          ),
          tr: ({ node, ...props }) => (
            <tr {...props} className="even:bg-muted/30" />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeText = String(children).replace(/\n$/, "");
            if (match) {
              return (
                <div className="relative group my-3">
                  <CopyButton text={codeText} />
                  <pre className="bg-muted p-3 rounded-lg overflow-auto text-xs border border-border/40">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            return (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border/40"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
