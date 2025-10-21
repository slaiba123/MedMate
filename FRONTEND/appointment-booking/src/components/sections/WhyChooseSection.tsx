"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  Activity,
  UserCheck,
  Ambulance,
  Video,
  Stethoscope,
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/utils/animations";

interface Service {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: keyof typeof colorMap;
}

const colorMap = {
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
};

const WhyChooseSection = () => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const services: Service[] = [
    {
      icon: UserCheck,
      title: "Special Nurse",
      description:
        "Clinical excellence must be the priority for any health care.",
      color: "purple",
    },
    {
      icon: Ambulance,
      title: "24/7 hrs Ambulance",
      description: "We provide our clients the most secured fast services",
      color: "cyan",
    },
    {
      icon: Video,
      title: "Telemedicine",
      description: "Telehealth is the distribution of health-related services.",
      color: "orange",
    },
    {
      icon: Stethoscope,
      title: "Qualified Doctors",
      description: "7bite Hospital aims to provide the highest possible level.",
      color: "blue",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-br from-gray-50 to-cyan-50 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-200 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Heading */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Activity className="w-6 h-6 text-purple-600" />
              <span className="text-purple-600 font-medium uppercase text-sm tracking-wide">
                WHY CHOOSE US
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 max-w-3xl mx-auto leading-tight">
              All-in-one treatment & health solution
            </h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explain to you how all this mistaken idea of denouncing pleasure
              and praising pain was born and I will give you a complete account
            </p>
          </motion.div>
        </motion.div>

        {/* Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={controls}
            variants={{ visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.div
              className="w-full h-96 bg-gradient-to-br from-purple-200 via-blue-200 to-cyan-200 rounded-3xl overflow-hidden shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src="/doc_img3.png"
                alt="Doctor consulting patient"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Right services */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={controls}
            className="space-y-6"
          >
            {services.map((service, index) => {
              const colorClass = colorMap[service.color];
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <motion.div
                      className={`w-16 h-16 ${colorClass.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}
                      transition={{ duration: 0.6 }}
                    >
                      <service.icon
                        className={`w-8 h-8 ${colorClass.text}`}
                      />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
