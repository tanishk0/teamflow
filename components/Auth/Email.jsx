import { useState } from "react";
import { Mail } from "lucide-react";

export default function EmailInput({value , onChange, error, onBlur}) {
  return (
    <div className="w-full flex flex-col gap-1">
      <label htmlFor="email" className="font-semibold text-xs">
        Email address
      </label>

      <div className="flex items-center h-9 border border-border rounded-md overflow-hidden">
        <Mail
          className="text-zinc-500 shrink-0 pl-3"
          strokeWidth={1.5}
          size={28}
        />

        <input
          type="text"
          name="email"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Enter your email"
          className="w-full h-full bg-transparent pl-2 outline-none text-xs placeholder:text-xs placeholder:text-text-secondary font-medium"
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
