import React,{useState,Suspense,lazy} from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import HeroSection from "./HeroSection";



const FeaturesSection = lazy(() => import("../Home/FeaturesSection"));
const TestimonialsSection = lazy(() => import("../Home/TestimonialsSection"));
const StatsSection = lazy(() => import("../Home/StatsSection"));
const CTASection = lazy(() => import("../Home/CTASection"));
const VideoModal = lazy(() => import('../Home/VideoModal'))


const HomePage = () => {

  const {userId}=useSelector((state)=>state.auth);
  const [showVideoModal, setShowVideoModal] = useState(false);


  

  if(userId){
    return <Navigate to='/dashboard' replace/>
  }



   const features = [
    {
      icon: "🏥",
      title: "Comprehensive Health Records",
      description: "Store and access all your medical history, test results, and health data in one secure location.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      icon: "🔒",
      title: "HIPAA Compliant Security", 
      description: "Your health information is protected with enterprise-grade security and encryption.",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      icon: "👥",
      title: "Doctor-Patient Collaboration",
      description: "Enable seamless communication between patients and healthcare providers for better care.",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      icon: "⏰",
      title: "24/7 Access",
      description: "Access your health records anytime, anywhere, from any device with internet connection.",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    {
      icon: "💊",
      title: "Prescription Management",
      description: "Doctors can easily prescribe medications and patients can track their prescriptions.",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    {
      icon: "📊",
      title: "Health Analytics",
      description: "Track your health trends and get insights to make informed decisions about your care.",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
    }
  ];

  const testimonials = [
    {
      name: "Rannveer Singh",
      role: "Patient", 
      content: "ChroniCare has revolutionized how I manage my health records. Everything is so organized and accessible!",
      rating: 5,
      image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=667eea&color=fff&size=80"
    },
    {
      name: "Dr. Aman Gurjar",
      role: "Cardiologist",
      content: "As a doctor, I love how easy it is to access patient histories and prescribe medications through this platform.",
      rating: 5,
      image: "https://ui-avatars.com/api/?name=Michael+Chen&background=f093fb&color=fff&size=80"
    },
    {
      name: "Alia Bhatt", 
      role: "Patient",
      content: "The seamless communication with my healthcare providers has made managing my chronic condition so much easier.",
      rating: 5,
      image: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=4facfe&color=fff&size=80"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Patients Served", icon: "👥" },
    { number: "500+", label: "Healthcare Providers", icon: "👨‍⚕️" },
    { number: "99.9%", label: "Uptime Guarantee", icon: "⚡" },
    { number: "24/7", label: "Support Available", icon: "🕐" }
  ];




  return (
    <>
      <HeroSection stats={stats} onWatchDemo={() => setShowVideoModal(true)} />

      <Suspense fallback={<div className="text-center my-5">Loading features...</div>}>
        <FeaturesSection features={features} />
      </Suspense>

      <Suspense fallback={<div className="text-center my-5">Loading testimonials...</div>}>
        <TestimonialsSection testimonials={testimonials} />
      </Suspense>

      <Suspense fallback={<div className="text-center my-5">Loading stats...</div>}>
        <StatsSection stats={stats} />
      </Suspense>

      <Suspense fallback={<div className="text-center my-5">Loading CTA...</div>}>
        <CTASection />
      </Suspense>

      <Suspense fallback={null}>
        <VideoModal show={showVideoModal} onHide={() => setShowVideoModal(false)} />
      </Suspense>
    </>
  );
};

export default HomePage;
