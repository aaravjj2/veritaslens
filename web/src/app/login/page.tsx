import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign in | VeritasLens",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-16">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>
        <p className="text-sm text-slate-400">
          Magic link via Supabase. After signing in, analyses you run from this
          browser are saved to your account when the database is configured.
        </p>
      </header>
      {error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          Sign-in failed ({error}). Try again or check Supabase redirect URLs.
        </p>
      )}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <LoginForm />
      </div>
      <p className="text-center text-sm text-slate-500">
        <Link href="/" className="text-indigo-300 hover:underline">
          ← Home
        </Link>
      </p>
    </div>
  );
}
