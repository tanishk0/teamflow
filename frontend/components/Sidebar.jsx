import { NavLink } from "react-router-dom";

export default function Sidebar({ items }) {
  return (
    <aside className="">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => {
            isActive ? "bg-primary text-white" : "text-gray-600";
          }}
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
