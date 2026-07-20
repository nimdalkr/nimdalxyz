import { notFound, redirect } from "next/navigation";

import { getWriterAccess } from "@/lib/auth";
import { BLOG_SLUG_PATTERN, getBlogEditorPost } from "@/lib/blog-editor";

import { EditorForm } from "../../_components/EditorForm";
import { EditorShell } from "../../_components/EditorShell";

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ deleteError?: string; saved?: string }>;
}

export default async function EditPostPage({ params, searchParams }: EditPostPageProps) {
  const access = await getWriterAccess();

  if (access.status === "configuration-required" || access.status === "signed-out") {
    redirect("/write/login");
  }

  if (access.status === "forbidden") {
    redirect("/write/forbidden");
  }

  const [{ slug }, { deleteError, saved }] = await Promise.all([params, searchParams]);

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
        queued={snapshot.queued}
        saved={saved === "1"}
        deleteError={deleteError === "conflict" ? "conflict" : deleteError === "failed" ? "failed" : undefined}
      />
    </EditorShell>
  );
}
