import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { user, checked, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Once signed in, the owner goes straight back to the portfolio, where the edit controls appear.
  if (checked && user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
      toast.success("Signed in. You can edit your portfolio now.");
    } catch (signInError) {
      setError(signInError.message);
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-accent/40 bg-surface p-8 shadow-glow">
        <h1 className="font-display text-3xl font-bold text-ink">Owner sign in</h1>
        <p className="mt-2 text-muted">Only the portfolio owner can edit this site. Visitors can read it freely.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-ink">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-rule bg-page px-4 py-2.5 text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-ink">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-rule bg-page px-4 py-2.5 text-ink outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <Link to="/" className="mt-6 inline-block text-sm text-muted hover:text-ink">
          Back to the portfolio
        </Link>
      </div>
    </div>
  );
}
