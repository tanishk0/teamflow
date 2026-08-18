import Hero from "../components/Hero";
import Navbar from "../components/Navbar";

export default function Landing() {
  return (
    <>
      <section className="w-full flex flex-col items-center bg-background h-screen">
        <Navbar />
        <Hero />
      </section>
    </>
  );
}
