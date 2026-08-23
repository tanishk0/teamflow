import Button from "./Button";
import { Link } from "react-router-dom";


export default function Navbar() {
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
      <div className="w-[12%] flex justify-between items-center">
        <Link to="/login">
          <button className="underline text-primary font-semibold cursor-pointer">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <Button text="Signup" />
        </Link>
      </div>
    </nav>
  );
}
