export default function Button({ className, onClick, text, type, onSubmit }) {
  return (
    <button
      className={`rounded-md cursor-pointer px-4 py-2 bg-primary text-white font-medium ${className}`}
      onClick={onClick}
      type={type}
      onSubmit={onSubmit}
    >
      {text}
    </button>
  );
}
