import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="blog-mdx-h2" {...props} />,
    h3: (props) => <h3 className="blog-mdx-h3" {...props} />,
    p: (props) => <p className="blog-mdx-p" {...props} />,
    ul: (props) => <ul className="blog-mdx-list" {...props} />,
    ol: (props) => <ol className="blog-mdx-list is-ordered" {...props} />,
    li: (props) => <li className="blog-mdx-li" {...props} />,
    a: (props) => <a className="blog-mdx-link" {...props} />,
    blockquote: (props) => <blockquote className="blog-mdx-quote" {...props} />,
    code: (props) => <code className="blog-mdx-code" {...props} />,
    pre: (props) => <pre className="blog-mdx-pre" {...props} />,
    strong: (props) => <strong className="blog-mdx-strong" {...props} />,
    ...components
  };
}
