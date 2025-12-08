import React from "react";
import Home from "../../components/Home";
import GenreSection from "../../components/GenreSection";
import AboutSection from "../../components/AboutSection";
import TopRatedSection from "../../components/TopRatedSection";
import Footer from "../../components/Footer";

const UHome = () => {
  return (
    <div className="min-h-full relative">
      <Home className="relative z-10" />
      <GenreSection className="relative z-0" />
      <TopRatedSection className="relative z-0" />
      <AboutSection className="relative z-0" />
      <Footer className="relative z-0" />
    </div>
  );
};

export default UHome;
