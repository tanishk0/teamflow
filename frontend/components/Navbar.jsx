import { useState, useEffect } from "react";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";
import api from "../src/api/axios";

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (token) return;

    api
      .get("/auth/me")
      .then((res) => {
        if (res.data?.user) {
          localStorage.setItem("token", "true");
          setToken("true");
        }
      })
      .catch(() => {
        setToken(null);
      });
  }, [token]);

  return (
    <nav className="w-full h-18 flex items-center justify-between p-8 font-sans bg-white">
      <div className="text-primary text-2xl">
        <span className="font-sans font-semibold text-text-primary">Team</span>
        <span className="font-serif italic">Flow</span>
      </div>
      <div className="w-100 flex justify-between text-text-primary text-sm font-medium">
        <a href="">Features</a>
        <a href="">Solutions</a>
        <a href="">Pricing</a>
      </div>
      <div className="flex items-center justify-end gap-4 min-w-[140px]">
        {token ? (
          <Button text="Open app" onClick={() => navigate("/dashboard")} />
        ) : (
          <>
            <Link to="/login">
              <button className="underline text-primary font-semibold cursor-pointer">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <Button text="Signup" />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
