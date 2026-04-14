'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NomiMarkdownProps {
  children: string;
}

/**
 * Markdown renderer for Nomi's prose. Maps each block/inline element to an
 * editorial Kaszek-themed variant — Archivo Black for headings, Fraunces
 * italic for emphasis, JetBrains Mono for inline code and numbers.
 */
export function NomiMarkdown({ children }: NomiMarkdownProps) {
  return (
    <div className="nomi-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="nomi-p">{children}</p>,
          strong: ({ children }) => (
            <strong
              style={{
                fontWeight: 700,
                color: 'var(--fg)',
                letterSpacing: '-0.005em',
              }}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em
              className="k-italic-serif"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontStyle: 'italic',
                letterSpacing: '-0.005em',
                color: 'var(--fg)',
              }}
            >
              {children}
            </em>
          ),
          h1: ({ children }) => <h3 className="nomi-h">{children}</h3>,
          h2: ({ children }) => <h3 className="nomi-h">{children}</h3>,
          h3: ({ children }) => <h3 className="nomi-h">{children}</h3>,
          h4: ({ children }) => <h4 className="nomi-h-sm">{children}</h4>,
          ul: ({ children }) => <ul className="nomi-ul">{children}</ul>,
          ol: ({ children }) => <ol className="nomi-ol">{children}</ol>,
          li: ({ children }) => <li className="nomi-li">{children}</li>,
          hr: () => <div className="nomi-hr" />,
          code: (props: { inline?: boolean; children?: React.ReactNode }) => {
            const { inline, children: codeChildren } = props;
            if (inline) {
              return (
                <code
                  className="k-mono"
                  style={{
                    fontSize: '0.92em',
                    color: 'var(--fg)',
                    background: 'var(--bg-sunken)',
                    padding: '1px 5px',
                    borderRadius: 2,
                  }}
                >
                  {codeChildren}
                </code>
              );
            }
            return (
              <pre
                className="k-mono"
                style={{
                  fontSize: 11,
                  color: 'var(--fg-muted)',
                  background: 'var(--bg-sunken)',
                  padding: '10px 12px',
                  borderLeft: '2px solid var(--hairline-strong)',
                  overflowX: 'auto',
                  margin: '10px 0',
                }}
              >
                <code>{codeChildren}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote
              className="k-italic-serif"
              style={{
                borderLeft: '2px solid var(--accent)',
                paddingLeft: 14,
                color: 'var(--fg-muted)',
                fontSize: 15,
                margin: '10px 0',
              }}
            >
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              style={{
                color: 'var(--accent-dim)',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: 3,
              }}
            >
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>

      <style jsx>{`
        .nomi-prose {
          font-family: var(--font-kaszek-sans), Inter, -apple-system,
            'Helvetica Neue', sans-serif;
          font-size: 14.5px;
          line-height: 1.62;
          color: var(--fg);
          letter-spacing: -0.005em;
        }
        .nomi-prose :global(.nomi-p) {
          margin: 0 0 0.75em 0;
        }
        .nomi-prose :global(.nomi-p:last-child) {
          margin-bottom: 0;
        }
        .nomi-prose :global(.nomi-h) {
          font-family: var(--font-kaszek-display), 'Archivo Black', system-ui,
            sans-serif;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: -0.025em;
          color: var(--fg);
          margin: 0.85em 0 0.35em 0;
          line-height: 1.15;
        }
        .nomi-prose :global(.nomi-h-sm) {
          font-family: var(--font-kaszek-sans), Inter, system-ui, sans-serif;
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--k-green);
          margin: 0.85em 0 0.3em 0;
        }
        .nomi-prose :global(.nomi-ul),
        .nomi-prose :global(.nomi-ol) {
          margin: 0.4em 0 0.7em 0;
          padding-left: 1.2em;
        }
        .nomi-prose :global(.nomi-ul) {
          list-style: none;
        }
        .nomi-prose :global(.nomi-ol) {
          list-style: decimal;
        }
        .nomi-prose :global(.nomi-li) {
          position: relative;
          padding-left: 0.1em;
          margin-bottom: 0.3em;
        }
        .nomi-prose :global(.nomi-ul > .nomi-li)::before {
          content: '→';
          position: absolute;
          left: -1em;
          color: var(--accent);
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 12px;
        }
        .nomi-prose :global(.nomi-hr) {
          height: 1px;
          background: var(--hairline-strong);
          margin: 1em 0;
          border: none;
        }
        .nomi-prose :global(table) {
          border-collapse: collapse;
          width: 100%;
          margin: 0.8em 0;
          font-size: 12px;
        }
        .nomi-prose :global(th),
        .nomi-prose :global(td) {
          text-align: left;
          padding: 6px 10px;
          border-bottom: 1px solid var(--hairline);
        }
        .nomi-prose :global(th) {
          font-family: var(--font-kaszek-sans), Inter, system-ui, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--k-green);
        }
      `}</style>
    </div>
  );
}
