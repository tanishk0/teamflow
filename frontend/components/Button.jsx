export default function Button({ className, onClick, text, type, onSubmit, variant = "primary" }) {
  const baseClasses = "rounded-xl cursor-pointer px-6 py-3 font-medium transition-colors";

  const variantClasses = {
    primary: "bg-primary hover:bg-primary-hover text-white",
    secondary: "bg-surface-muted hover:bg-border text-text-primary",
    outline: "border border-border hover:bg-surface-muted text-text-primary",
    danger: "bg-danger hover:bg-red-700 text-white"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      type={type}
      onSubmit={onSubmit}
    >
      {text}
    </button>
  );
}
