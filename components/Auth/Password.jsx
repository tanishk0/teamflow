import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordInput({
  value,
  onChange,
  error,
  touched,
  onBlur,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full flex flex-col gap-1">
      <label htmlFor="password" className="font-semibold text-xs">
        Password
      </label>

      <div className="flex items-center h-9 border border-border rounded-md overflow-hidden">
        <Lock
          className="text-zinc-500 shrink-0 pl-3"
          strokeWidth={1.5}
          size={28}
        />

        <input
          id="password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Enter your password"
          className="w-full h-full bg-transparent pl-2 outline-none text-xs placeholder:text-xs placeholder:text-text-secondary font-medium"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="mr-3 text-zinc-500 cursor-pointer"
        >
          {showPassword ? (
            <EyeOff size={16} strokeWidth={1.5} />
          ) : (
            <Eye size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>

      {touched && error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
