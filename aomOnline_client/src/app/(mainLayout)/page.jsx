import Hero from "@/components/Home/Hero";
import ClassesPreview from "@/components/Home/ClassesPreview";
import StatsBand from "@/components/Home/StatsBand";
import WhatWeOffer from "@/components/Home/WhatWeOffer";
import HowItWorks from "@/components/Home/HowItWorks";
import LiveClassDemo from "@/components/Home/LiveClassDemo";
import StudentsPresentation from "@/components/Home/StudentsPresentation";
import StudentAchievement from "@/components/Home/StudentAchievement";
import ParentsReview from "@/components/Home/ParentsReview";
import HomeCtaBand from "@/components/Home/HomeCtaBand";

export const metadata = {
  title: "Home — Authentic Quran & Islamic Studies Online",
  description:
    "AOM Online Madrasa — learn authentic Quran recitation, Tajweed, Hifz, and Islamic studies from home under experienced ustadhs. Enroll today.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClassesPreview />
      <StatsBand />
      <WhatWeOffer />
      <HowItWorks />
      <LiveClassDemo />
      <StudentsPresentation />
      <StudentAchievement />
      <ParentsReview />
      <HomeCtaBand />
    </>
  );
}
