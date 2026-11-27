const VARIANTS = {
  primary: "bg-gradient-to-r from-accent to-violet text-white shadow-glow hover:brightness-110",
  secondary: "border border-accent/50 text-ink hover:border-accent hover:bg-accent/10",
  ghost: "text-muted hover:text-ink",
};

// Use this on links that should look like buttons.
export function buttonClasses(variant = "secondary") {
  return `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]}`;
}

export default function Button({ variant = "secondary", className = "", children, ...props }) {
  return (
    <button type="button" className={`${buttonClasses(variant)} ${className}`} {...props}>
      {children}
    </button>
  );
}
