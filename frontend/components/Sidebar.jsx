import { NavLink } from "react-router-dom";

export default function Sidebar({ items }) {
  return (
    <aside className="flex flex-col w-[16%] px-4 py-4 bg-white">
      <div className="text-primary text-2xl">
        <span className="font-sans font-semibold text-text-primary">Team</span>
        <span className="font-serif italic">Flow</span>
      </div>
      <div className="flex flex-col mt-4">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-primary font-semibold text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
