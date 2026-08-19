import { Link } from "react-router-dom";
import EmailInput from "../../components/Auth/Email";
import PasswordInput from "../../components/Auth/Password";
import Button from "../../components/Button";
import { validateEmail, validateLoginPassword } from "../../src/utils/validation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const emailError = validateEmail(email);
  const passwordError = validateLoginPassword(password);

  function handleSubmit(e) {
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
    console.log({
      email,
      password,
    });
  }
  return (
    <section className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="w-100 h-140 pt-8 bg-white shadow-md">
        <div className="flex flex-col gap-1 items-center justify-center mb-4">
          <h2 className="text-xl font-semibold">Create your account</h2>
          <p className="text-xs">
            <span className="text-text-secondary">Don't have an account? </span>
            <Link className="text-primary underline font-semibold" to="/signup">
              Signup
            </Link>{" "}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full h-full flex flex-col gap-4 items-center p-8">
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
            text="Log in"
            className="mt-2 w-full text-sm"
            type="submit"
          ></Button>
        </form>
      </div>
    </section>
  );
}
