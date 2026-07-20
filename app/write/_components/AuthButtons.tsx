"use client";

import { ArrowRight, SignOut } from "@phosphor-icons/react";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";

import styles from "../write.module.css";

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      className={styles.primaryButton}
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signIn("google", { callbackUrl: "/write" });
      }}
    >
      <span>{pending ? "Google로 이동 중" : "Google 계정으로 계속"}</span>
      <ArrowRight aria-hidden="true" size={18} weight="bold" />
    </button>
  );
}

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      className={styles.railButton}
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signOut({ callbackUrl: "/write/login" });
      }}
    >
      <SignOut aria-hidden="true" size={17} />
      <span>{pending ? "로그아웃 중" : "로그아웃"}</span>
    </button>
  );
}
