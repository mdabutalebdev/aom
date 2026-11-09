import AdmissionHero from "@/components/Admission/AdmissionHero";
import AdmissionForm from "@/components/Admission/AdmissionForm";

export const metadata = {
  title: "Admission — Apply Online",
  description:
    "Apply online for admission at AOM Online Madrasa. Fill out the admission form for Qaida, Nazera, Hifz, or Ampara classes.",
};

export default function AdmissionPage() {
  return (
    <>
      <AdmissionHero />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-16">
        <AdmissionForm />
      </section>
    </>
  );
}
