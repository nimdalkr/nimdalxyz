import Markdoc from "@markdoc/markdoc";
import React from "react";

import type { BlogContentLoader } from "@/content/blog/posts";

export async function BlogPostBody({ load }: { load: BlogContentLoader }) {
  const { node } = await load();
  const errors = Markdoc.validate(node);

  if (errors.length > 0) {
    console.error("Invalid BLOG Markdoc content", errors);
    throw new Error("This blog post contains invalid content.");
  }

  const renderable = Markdoc.transform(node, {
    nodes: {
      document: { render: "div" }
    }
  });

  return <>{Markdoc.renderers.react(renderable, React)}</>;
}
