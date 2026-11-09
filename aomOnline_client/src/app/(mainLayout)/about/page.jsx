import AboutHero from "@/components/About/AboutHero";
import MissionVision from "@/components/About/MissionVision";
import StatsBand from "@/components/About/StatsBand";
import Values from "@/components/About/Values";
import CtaBand from "@/components/Home/CtaBand";

export const metadata = {
  title: "About Us — Mission, Vision & Values",
  description:
    "Learn about AOM Online Madrasa's mission, vision, message, and values. Illuminating every life with the light of the Quran is our goal.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <MissionVision />
      <StatsBand />
      <Values />
      <CtaBand />
    </>
  );
}
