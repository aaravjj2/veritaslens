import Link from "next/link";
import SettingsForm from "./SettingsForm";

export const metadata = {
  title: "Settings | VeritasLens",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <header>
        <h1 className="text-3xl font-semibold text-white">Account settings</h1>
        <p className="mt-2 text-sm text-slate-400">
          Language preference and weekly digest opt-in (stored in Supabase{" "}
          <code className="rounded bg-black/40 px-1 text-xs">users_meta</code>
          ).
        </p>
      </header>
      <SettingsForm />
      <Link href="/dashboard" className="text-sm text-indigo-300 hover:underline">
        ← Dashboard
      </Link>
    </div>
  );
}
