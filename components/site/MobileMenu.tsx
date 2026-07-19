"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import type { Locale } from "@/lib/content";
import { LocaleSwitch } from "@/components/site/LocaleSwitch";

interface MobileMenuProps {
  locale: Locale;
  labels: {
    work: string;
    lab: string;
    about: string;
    log: string;
    contact: string;
  };
}

export function MobileMenu({ locale, labels }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="mobile-menu">
      <button
        type="button"
        className="icon-button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        {open ? <X aria-hidden weight="bold" /> : <List aria-hidden weight="bold" />}
      </button>
      {open ? (
        <div className="mobile-menu-panel" id="mobile-navigation">
          <nav aria-label="Mobile navigation">
            <Link href={`/${locale}#work`} onClick={closeMenu}>{labels.work}</Link>
            <Link href={`/${locale}#lab`} onClick={closeMenu}>{labels.lab}</Link>
            <Link href={`/${locale}#about`} onClick={closeMenu}>{labels.about}</Link>
            <Link href={`/${locale}#log`} onClick={closeMenu}>{labels.log}</Link>
            <Link href={`/${locale}#contact`} onClick={closeMenu}>{labels.contact}</Link>
          </nav>
          <LocaleSwitch locale={locale} compact />
        </div>
      ) : null}
    </div>
  );
}
