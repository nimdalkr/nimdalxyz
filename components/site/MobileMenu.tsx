"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { LocaleSwitch } from "@/components/site/LocaleSwitch";
import type { Locale } from "@/lib/content";
import { blogCanonicalUrl } from "@/lib/seo";

interface MobileMenuProps { locale: Locale; absoluteOrigin?: string; }

export function MobileMenu({ locale, absoluteOrigin }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const copy = locale === "ko"
    ? { open: "메뉴 열기", close: "메뉴 닫기", about: "소개", career: "경력", blog: "블로그" }
    : { open: "Open menu", close: "Close menu", about: "About", career: "Career", blog: "Blog" };

  return (
    <div className="mobile-menu">
      <button type="button" className="icon-btn" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? copy.close : copy.open}>
        {open ? <X size={19} weight="bold" aria-hidden /> : <List size={19} weight="bold" aria-hidden />}
      </button>
      {open ? (
        <div className="mobile-panel" id="mobile-navigation">
          <nav aria-label={locale === "ko" ? "모바일 메뉴" : "Mobile navigation"}>
            <Link href={`/${locale}/about`} onClick={() => setOpen(false)}>{copy.about}</Link>
            <Link href={`/${locale}/portfolio`} onClick={() => setOpen(false)}>{copy.career}</Link>
            <a href={blogCanonicalUrl(locale)} onClick={() => setOpen(false)}>{copy.blog}</a>
          </nav>
          <LocaleSwitch locale={locale} compact absoluteOrigin={absoluteOrigin} />
        </div>
      ) : null}
    </div>
  );
}
