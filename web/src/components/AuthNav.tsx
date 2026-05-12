"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export default function AuthNav() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowser();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setEmail(data.session?.user.email ?? null);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!ready) {
    return <span className="text-slate-500">…</span>;
  }

  if (!supabase) {
    return (
      <span className="text-xs text-amber-400/90" title="Set NEXT_PUBLIC_SUPABASE_* env vars">
        Auth off
      </span>
    );
  }

  if (email) {
    return (
      <div className="flex items-center gap-3 text-xs text-slate-300">
        <span className="max-w-[140px] truncate" title={email}>
          {email}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-indigo-300 hover:text-indigo-200"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="text-indigo-300 hover:text-indigo-200">
      Sign in
    </Link>
  );
}
