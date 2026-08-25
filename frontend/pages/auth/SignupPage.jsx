import { Link } from "react-router-dom";
import { useState } from "react";
import EmailInput from "../../components/Auth/Email";
import PasswordInput from "../../components/Auth/Password";
import FullName from "../../components/Auth/FullName";
import Button from "../../components/Button";
import { validateEmail, validatePassword } from "../../../shared/validation";

import { useNavigate } from "react-router-dom";


import api from "../../src/api/axios";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  async function handleSubmit(e) {
    e.preventDefault();

    // Mark everything as touched when submitting
    setTouched({
      email: true,
      password: true,
    });

    // Don't submit invalid form
    if (emailError || passwordError) {
      return;
    }

    // API request will go here
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    }
  }
  return (
    <section className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="w-100 h-140 bg-white shadow-md">
        <div className="flex flex-col gap-1 pt-8 items-center justify-center mb-4">
          <h2 className="text-xl font-semibold">Create your account</h2>
          <p className="text-xs">
            <span className="text-text-secondary">
              Already have an account?{" "}
            </span>
            <Link className="text-primary underline font-semibold" to="/login">
              Login
            </Link>{" "}
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4 items-center p-8 h-full"
        >
          <FullName value={name} onChange={(e) => setName(e.target.value)} />
          <EmailInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            touched={touched.email}
            onBlur={() =>
              setTouched((prev) => ({
                ...prev,
                email: true,
              }))
            }
          />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            touched={touched.password}
            onBlur={() =>
              setTouched((prev) => ({
                ...prev,
                password: true,
              }))
            }
          />

          <Button
            text="Create Account"
            className="mt-2 w-full text-sm"
            type="Submit"
            onSubmit={handleSubmit}
          ></Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </div>
    </section>
  );
}
