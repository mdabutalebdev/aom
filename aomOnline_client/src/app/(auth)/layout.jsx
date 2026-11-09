import Image from "next/image";
import Link from "next/link";

// Shared authentication layout.
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center brand-gradient-soft px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        {/*    */}
        <Link href="/" className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image
            src="/logo.jpg"
            alt="AOM Online Madrasa "
            width={64}
            height={64}
            className="rounded-[var(--radius-lg)] shadow-soft"
            priority
          />
          <span className="text-xl font-semibold text-primary-700">
            AOM Online Madrasa
          </span>
        </Link>

        {children}

        <p className="mt-6 text-center text-sm text-primary-600">
          Pure Quranic and Islamic Education from Home
        </p>
      </div>
    </div>
  );
}
