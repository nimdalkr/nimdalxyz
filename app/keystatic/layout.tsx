import { notFound } from "next/navigation";

import { isKeystaticAdminEnabled } from "@/lib/keystatic";

import KeystaticApp from "./keystatic";

export const metadata = {
  title: "Nimdal BLOG Editor",
  robots: {
    index: false,
    follow: false
  }
};

export default function KeystaticLayout() {
  if (!isKeystaticAdminEnabled) {
    notFound();
  }

  return (
    <html lang="ko">
      <body>
        <KeystaticApp />
      </body>
    </html>
  );
}
