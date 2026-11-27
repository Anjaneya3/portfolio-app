import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl font-bold text-ink">Page not found</h1>
        <p className="mt-3 text-muted">The address you opened doesn't exist. Check the link or return to the portfolio.</p>
        <Link to="/" className="mt-6 inline-block font-semibold text-accent hover:underline">
          Back to the portfolio
        </Link>
      </div>
    </div>
  );
}
