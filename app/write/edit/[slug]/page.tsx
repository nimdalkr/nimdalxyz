import { notFound, redirect } from "next/navigation";

import { getWriterAccess } from "@/lib/auth";
import { BLOG_SLUG_PATTERN, getBlogEditorPost } from "@/lib/blog-editor";

import { EditorForm } from "../../_components/EditorForm";
import { EditorShell } from "../../_components/EditorShell";

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditPostPage({ params, searchParams }: EditPostPageProps) {
  const access = await getWriterAccess();

  if (access.status === "configuration-required" || access.status === "signed-out") {
    redirect("/write/login");
  }

  if (access.status === "forbidden") {
    redirect("/write/forbidden");
  }

  const [{ slug }, { saved }] = await Promise.all([params, searchParams]);

  if (!BLOG_SLUG_PATTERN.test(slug)) {
    notFound();
  }

  const snapshot = await getBlogEditorPost(slug);

  if (!snapshot) {
    notFound();
  }

  return (
    <EditorShell email={access.session.user?.email ?? ""} section="edit">
      <EditorForm
        document={snapshot.document}
        expectedHeadOid={snapshot.expectedHeadOid}
        mode="edit"
        saved={saved === "1"}
      />
    </EditorShell>
  );
}
