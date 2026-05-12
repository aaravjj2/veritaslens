import Link from "next/link";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "History | VeritasLens",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-slate-100">
      <header>
        <h1 className="text-3xl font-semibold">Analysis history</h1>
        <p className="mt-2 text-sm text-slate-400">
          When you are signed in and Supabase is configured, your analyses appear
          here from the database. Local share IDs from this browser are listed
          separately.
        </p>
      </header>
      <DashboardClient />
      <Link href="/analyse" className="text-sm text-indigo-300 hover:underline">
        ← Back to analyser
      </Link>
    </div>
  );
}
