import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Privacy from "@/components/Privacy";
import Features from "@/components/Features";
import Benefits from "@/components/Benefits";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <Features />
        <Privacy />
        <Benefits />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
