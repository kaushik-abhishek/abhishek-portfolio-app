import React from "react";
import Navbar from "./component/Navbar/Navbar";
import Footer from "./component/Footer/Footer";
import About from "./component/About/About";
import BlurBlob from "./component/BlurBlob";
import Skills from "./component/Skills/Skills";
import Experience from "./component/Experience/Experience";
import Education from "./component/Education/Education";
import Contact from "./component/Contact/Contact";

const App = () => {
  return (
    <div className="bg-[#050414]">
      <BlurBlob
        position={{ top: "35%", left: "20%" }}
        size={{ width: "30%", height: "40%" }}
      />

      {/* Background Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] 
        bg-[size:14px_24px] 
        [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      ></div>

      {/* Main Content */}
      <div className="relative pt-20">
        <Navbar />
        <About />
        <Skills />
        <Experience />
        <Education />
        <Contact />
        <Footer />
      </div>
    </div>
  );
};

export default App;
