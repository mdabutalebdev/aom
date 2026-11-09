import ContactHero from "@/components/Contact/ContactHero";
import ContactInfo from "@/components/Contact/ContactInfo";
import ContactForm from "@/components/Contact/ContactForm";

export const metadata = {
  title: "Contact — Get in Touch With Us",
  description:
    "Contact AOM Online Madrasa. Reach us by phone, email, or the contact form for admissions, courses, or any other questions.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <ContactInfo />
          <ContactForm />
        </div>
      </section>
    </>
  );
}
