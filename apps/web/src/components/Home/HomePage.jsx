import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useLocation } from "react-router-dom";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import CTASection from "./CTASection";

const HomePage = () => {
  const { userId } = useSelector((state) => state.auth);
  const { hash } = useLocation();

  // The router doesn't scroll to #anchors on its own (used by the "Features" link in the header).
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  if (userId) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <footer className="cc-footer">
        © ChroniCare · <Link to="/contact">Contact</Link>
      </footer>
    </>
  );
};

export default HomePage;
