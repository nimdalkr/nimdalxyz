import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    p: (props) => (
      <p className="text-[13px] leading-[1.6] text-[var(--text-secondary)]" {...props} />
    ),
    strong: (props) => (
      <strong className="font-[500] text-[var(--text-primary)]" {...props} />
    ),
    ...components
  };
}
