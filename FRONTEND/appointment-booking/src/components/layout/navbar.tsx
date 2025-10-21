"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const mobileMenuVariants = {
  hidden: { opacity: 0, maxHeight: 0, overflow: "hidden" },
  visible: {
    opacity: 1,
    maxHeight: 600,
    overflow: "hidden",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, maxHeight: 0, overflow: "hidden", transition: { duration: 0.2 } },
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const navLinks = [
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "process", label: "Process" },
    { id: "testimonials", label: "Testimonials" },
    { id: "Doctors", label: "Doctors" },
    
  ];

  const handleNavClick = (id: string) => {
    if (pathname === "/") {
      // ✅ Already on homepage — smooth scroll
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } else {
      // ✅ Redirect to homepage, scroll after mount
      router.push(`/${id}`);
    }
  };

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold text-gray-800"
        >
          <div className="flex items-center justify-center">
          <img src="/icon.png" alt="Logo" width={60}  />
          <p className="inline-block align-middle ml-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-[#a280ff] font-bold">
           MedMate
          </p>

          </div>
        
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className="text-blue-900 font-bold hover:text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-[#a280ff]"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col space-y-1.5 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <span className="block w-6 h-0.5 bg-gray-800"></span>
          <span className="block w-6 h-0.5 bg-gray-800"></span>
          <span className="block w-6 h-0.5 bg-gray-800"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-white shadow-md flex flex-col space-y-4 px-4 py-3"
            variants={{
              hidden: { opacity: 0, maxHeight: 0, overflow: "hidden" },
              visible: { opacity: 1, maxHeight: 600, overflow: "hidden", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
              exit: { opacity: 0, maxHeight: 0, overflow: "hidden", transition: { duration: 0.2 } },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {navLinks.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => {
                  handleNavClick(id);
                  setIsOpen(false);
                }}
                className="text-gray-700 hover:text-gray-900 text-left transition"
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
