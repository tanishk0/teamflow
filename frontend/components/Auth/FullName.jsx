import { UserIcon } from "lucide-react";
import { useState } from "react";

export default function FullName({value , onChange}) {
  return (
    <div className="w-full flex flex-col gap-1">
      <label htmlFor="name" className="font-semibold text-xs">
        Full Name
      </label>

      <div className="flex items-center h-9 border border-border rounded-md overflow-hidden">
        <UserIcon
          className="text-zinc-500 shrink-0 pl-3"
          strokeWidth={1.5}
          size={28}
        />

        <input
          type="text"
          name="name"
          placeholder="Enter your email"
          value={value}
          onChange={onChange}
          className="w-full h-full bg-transparent pl-2 outline-none text-xs placeholder:text-xs placeholder:text-text-secondary font-medium"
        />
      </div>
    </div>
  );
}
