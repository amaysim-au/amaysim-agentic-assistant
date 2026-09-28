import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

// No rehype-raw, so raw HTML from the model is never rendered; images are dropped to avoid remote loads.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        disallowedElements={['img']}
        unwrapDisallowed
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
