import { redirect } from "next/navigation";

import { getWriterAccess } from "@/lib/auth";
import { getBlogEditorPosts, type BlogEditorPostDocument } from "@/lib/blog-editor";

import { EditorForm } from "../_components/EditorForm";
import { EditorShell } from "../_components/EditorShell";

function blankDocument(): BlogEditorPostDocument {
  const today = new Date().toISOString().slice(0, 10);

  return {
    slug: "",
    status: "published",
    publishedAt: today,
    updatedAt: today,
    cover: "/media/identity-octopus.jpg",
    coverWidth: 400,
    coverHeight: 400,
    ko: {
      title: "",
      description: "",
      category: "",
      tags: [],
      readingTime: ""
    },
    en: {
      title: "",
      description: "",
      category: "",
      tags: [],
      readingTime: ""
    },
    bodyKo: "",
    bodyEn: ""
  };
}

export default async function NewPostPage() {
  const access = await getWriterAccess();

  if (access.status === "configuration-required" || access.status === "signed-out") {
    redirect("/write/login");
  }

  if (access.status === "forbidden") {
    redirect("/write/forbidden");
  }

  const { expectedHeadOid } = await getBlogEditorPosts();

  return (
    <EditorShell email={access.session.user?.email ?? ""} section="new">
      <EditorForm
        document={blankDocument()}
        expectedHeadOid={expectedHeadOid}
        mode="new"
        saved={false}
      />
    </EditorShell>
  );
}
