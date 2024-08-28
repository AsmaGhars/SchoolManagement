import Image from "next/image";
import Head from 'next/head';
import Program from "../components/Program";
import Footer from "../components/Footer";
import "../app/globals.css";
import Hero from "@/components/Hero";
import Aboutus from "@/components/Aboutus";
import Title from "@/components/Title";
import Contact from "../components/Contact";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>MySchool</title>
      </Head>
      <div>
        <main>
          <Hero />
          <div>
            <Title
              subTitle="Welcome to Myschool"
              title="We Offer Accounts For"
            />
            <Program />
          </div>
          <div>
            <Title
              subTitle="About Myschool"
              title="Transforming School Management Together"
            />
            <Aboutus />
          </div>
          <div>
            <Title subTitle="Contact Us" title="Get In Touch" />
            <Contact />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
