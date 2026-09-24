import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import api from "../src/api/axios";

export default function Landing() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(!token);

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        if (res.data?.user) {
          localStorage.setItem("token", "true");
          setToken("true");
          navigate("/dashboard", { replace: true });
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [navigate, token]);

  if (token || loading) {
    return <section className="w-full bg-background min-h-screen" />;
  }

  return (
    <section className="w-full flex flex-col items-center bg-background min-h-screen">
      <Navbar />
      <Hero />
    </section>
  );
}
