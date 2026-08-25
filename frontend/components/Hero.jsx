import Button from "./Button";
import demo from "../src/assets/demo.png";
import { Link } from "react-router-dom";
export default function Hero() {
  return (
    <div className="p-8 w-full flex flex-col items-center justify-around bg-none">
      <div className="flex flex-col items-center p-4">
        <h2 className="flex flex-col items-center">
          <span className="tracking-tight text-5xl font-semibold font-sans text-primary-text">
            Work Together.{" "}
          </span>
          <span className="text-5xl font-serif font-medium text-primary italic">
            Ship Faster.
          </span>
        </h2>
        <p className="mt-4 text-xl font-semibold text-text-secondary">
          Plan projects, assign tasks, and keep your team moving forward—all in
          one place.
        </p>
      </div>
      <Link to="/signup">
        <Button text="Get Started" />
      </Link>
      <div className="mt-8">
        <img
          src={demo}
          alt=""
          className="rounded-xl border border-border w-full max-w-5xl h-auto shadow-lg"
        />
      </div>
    </div>
  );
}
