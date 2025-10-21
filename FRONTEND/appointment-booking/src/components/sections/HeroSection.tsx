"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Stethoscope, PhoneCall, X } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/utils/animations";
import Image from "next/image";
import Script from "next/script";
const HeroSection = () => {
  const [showVapiHint, setShowVapiHint] = useState(true);
 
  // Load Vapi Widget
  useEffect(() => {
    // Create widget element
    const widget = document.createElement('vapi-widget');
    
   
    widget.setAttribute('public-key', 'ee0c1619-d378-4e18-89f4-8bba228c8d36');
    widget.setAttribute('assistant-id', '4d4357ee-ad18-48d6-b41c-3d6061607085');
    widget.setAttribute('mode', 'voice');
    widget.setAttribute('theme', 'dark');
    widget.setAttribute('base-bg-color', '#ffffff'); 
    widget.setAttribute('accent-color', '#ffffff'); 
    widget.setAttribute('cta-button-color', '#06b6d4'); 
    widget.setAttribute('cta-button-text-color', '#ffffff');
    widget.setAttribute('border-radius', 'large');
    widget.setAttribute('size', 'tiny');
    widget.setAttribute('position', 'bottom-right');
    widget.setAttribute('title', 'TALK WITH AI');
    widget.setAttribute('start-button-text', 'Start');
    widget.setAttribute('end-button-text', 'End Call');
    widget.setAttribute('chat-first-message', 'Hey, How can I help you today?');
    widget.setAttribute('chat-placeholder', 'Type your message...');
    widget.setAttribute('voice-show-transcript', 'true');
    widget.setAttribute('consent-required', 'true');
    widget.setAttribute('consent-title', 'Terms and conditions');
    widget.setAttribute('consent-content', 'By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.');
    widget.setAttribute('consent-storage-key', 'vapi_widget_consent');
    
    // Append to body
    document.body.appendChild(widget);

    // Auto-hide hint after 10 seconds
    const timer = setTimeout(() => {
      setShowVapiHint(false);
    }, 10000);

    // Cleanup
    return () => {
      clearTimeout(timer);
      const existingWidget = document.querySelector('vapi-widget');
      if (existingWidget) {
        existingWidget.remove();
      }
    };
  }, []);

  return (
    <>
      {/* Load Vapi Widget Script */}
      <Script
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
        strategy="afterInteractive"
      />

      <section className="relative min-h-screen bg-gradient-to-br from-white to-gray-50 overflow-hidden mt-6">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full opacity-10"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-12 lg:py-0">
            {/* Left content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-8 h-8 text-purple-600" />
                  <span className="text-purple-600 font-medium">
                    Premium Healthcare
                  </span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  We follow a{" "}
                  <motion.span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600"
                    animate={{
                      backgroundPosition: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    holistic approach
                  </motion.span>
                  <br />
                  to <span className="text-blue-900">health care.</span>
                </h1>

                <p className="text-lg text-gray-600 max-w-lg">
                  This is open to everyone every day and provides primary health
                  care and cutting-edge medicine in a central location
                </p>
            

              </motion.div>
            </motion.div>

            {/* Right doctor image + hoverable cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative lg:-mt-32"
            >
              <motion.div className="relative" whileHover="hovered">
                {/* Main doctor image */}
                <motion.div
                  className="relative w-[28rem] h-[28rem] mx-auto rounded-full overflow-hidden shadow-2xl ring-8 ring-white bg-transparent"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Image
                    src="/doc_img1.jpg"
                    alt="Doctor"
                    fill
                    className="object-cover object-center rounded-full"
                    priority
                  />
                </motion.div>

                {/* Floating doctor card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  variants={{
                    hovered: {
                      x: -80,
                      y: -40,
                      transition: { duration: 0.15, ease: "easeOut" },
                    },
                    initial: { x: 0, y: 0 },
                  }}
                  className="absolute -top-8 -left-4 bg-white rounded-xl shadow-lg p-4 border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Dr. Anwar Kamal
                      </h3>
                      <p className="text-sm text-gray-600">Cardiology Specialist</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating appointment card */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  variants={{
                    hovered: {
                      x: 80,
                      y: 40,
                      transition: { duration: 0.15, ease: "easeOut" },
                    },
                    initial: { x: 0, y: 0 },
                  }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tue, 24</span>
                      <span className="text-sm text-gray-600">10:00AM</span>
                    </div>
                    <div className="text-xs text-purple-600 font-medium">
                      Consultation
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <span className="text-sm text-gray-700">Sarah Ahmed</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Floating Vapi Widget Hint */}
        <AnimatePresence>
          {showVapiHint && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-[180px] right-6 z-[9998]"
            >
              <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-xs">
                <button
                  onClick={() => setShowVapiHint(false)}
                  className="absolute -top-2 -right-2 bg-white text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors shadow-lg"
                  aria-label="Close hint"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex items-start space-x-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <PhoneCall className="w-6 h-6 flex-shrink-0 mt-3" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      Book Voice Appointment
                    </h4>
                    <p className="text-xs text-cyan-50">
                      Click the AI assistant button below to schedule your appointment instantly!
                    </p>
                  </div>
                </div>

                {/* Arrow pointing to widget */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -bottom-8 right-8 text-cyan-500"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L12 18M12 18L6 12M12 18L18 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default HeroSection;