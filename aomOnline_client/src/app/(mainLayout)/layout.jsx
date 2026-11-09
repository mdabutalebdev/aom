import TopHeader from "@/components/shared/TopHeader";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

// Public website layout — TopHeader + Navbar + {children} + Footer.
// Only renders in (mainLayout) route group; not in (auth)/(dashboardLayout).
export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopHeader />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
