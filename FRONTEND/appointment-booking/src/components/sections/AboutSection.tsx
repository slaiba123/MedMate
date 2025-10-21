"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Activity, Clock, Shield, Phone, Users } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/utils/animations";
import { useRouter } from "next/navigation";
const AboutSection = () => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const router = useRouter();
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={controls}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-purple-600" />
                <span className="text-purple-600 font-medium uppercase text-sm tracking-wide">
                  ABOUT US
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Our qualified team is ready to answer your questions!
              </h2>

              <p className="text-lg text-gray-600">
                Our team of highly trained professionals can help you feel
                better quickly and easily by using the latest healing
                technologies.
              </p>
            </motion.div>

            {/* Highlights grid */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: Clock, text: "20+ years of excellence" },
                { icon: Shield, text: "Multi Speciality Hospital" },
                { icon: Phone, text: "24 Hours Medical Service" },
                { icon: Users, text: "Professional Experts" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                  whileHover={{ x: 10 }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA button */}
            <motion.button
              variants={fadeInUp}
              onClick={() => router.push("/Doctors")}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Book an Appointment
            </motion.button>
          </motion.div>

          {/* Right side images */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={controls}
            variants={{ visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* First image card */}
            <div className="relative">
              <motion.div
                className="w-full h-64 bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl overflow-hidden shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src="/surgeon-operation.jpg"
                  alt="Surgeon in operation"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Second image card */}
            <div className="relative">
              <motion.div
                className="w-full h-64 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-2xl overflow-hidden shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src="/doc-injecting-kid.png"
                  alt="Doctor injecting kid"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
