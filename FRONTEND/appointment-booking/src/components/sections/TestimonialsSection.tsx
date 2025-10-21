"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Activity, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/utils/animations";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar: string;
}

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  const testimonials: Testimonial[] = [
    { name: "Sarah Khan", role: "Patient", text: "Booking an appointment through MedMate was so easy! I found the right specialist in minutes and didn’t have to wait in long hospital lines.", avatar: "S" },
    { name: "Ali Raza", role: "Software Engineer", text: "MedMate made my life easier. I scheduled my consultation online, got reminders, and even managed follow-up visits through the app.", avatar: "A" },
    { name: "Dr. Ayesha Malik", role: "Dermatologist", text: "As a doctor, I appreciate how organized and efficient MedMate is. It helps me connect with patients quickly and manage my schedule effortlessly.", avatar: "D" },
    { name: "Hassan Javed", role: "Marketing Manager", text: "I was able to find a cardiologist near me and get an appointment within a day. The reminders and notifications were a great touch!", avatar: "H" },
    { name: "Fatima Noor", role: "Medical Student", text: "I love how intuitive the interface is. MedMate feels like a modern healthcare platform — simple, fast, and patient-centered.", avatar: "F" },
    { name: "Ahmed Ali", role: "Patient", text: "I booked my father’s consultation through MedMate. Everything from appointment booking to payment was smooth and transparent.", avatar: "A" },
    { name: "Dr. Kamran Siddiqui", role: "Orthopedic Surgeon", text: "MedMate has helped me manage patient appointments without any confusion. It's reliable and easy for both doctors and patients.", avatar: "K" },
    { name: "Nimra Aslam", role: "Teacher", text: "Finally, a healthcare app that actually works! I no longer have to make endless phone calls just to confirm an appointment.", avatar: "N" },
    { name: "Bilal Hussain", role: "Business Owner", text: "The platform feels professional and trustworthy. I could see doctor profiles, reviews, and book appointments seamlessly.", avatar: "B" },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 3) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev - 3 < 0 ? testimonials.length - 3 : prev - 3
    );
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

  return (
    <section ref={ref} className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
                TESTIMONIALS
              </span>
            </div>
            <h2 className="text-4xl lg:text-3xl font-bold text-gray-900">
             Our Clients Opinion
            </h2>
          </motion.div>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative flex items-center justify-center">
          {/* Prev Button */}
          <motion.button
            onClick={prevSlide}
            className="absolute left-0 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </motion.button>

          {/* Cards */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center gap-8 w-full"
          >
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="flex-1 bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 max-w-sm"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600 mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Next Button */}
          <motion.button
            onClick={nextSlide}
            className="absolute right-0 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
