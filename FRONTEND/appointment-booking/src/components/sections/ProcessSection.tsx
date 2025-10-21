"use client";

import React from "react";
import { Activity } from "lucide-react";

interface Step {
  number: string;
  title: string;
  color: string;
}

const ProcessSection = () => {
  const steps: Step[] = [
    {
      number: "01",
      title: "Select Expert Doctor",
      color: "purple",
    },
    {
      number: "02",
      title: "Make Appointment",
      color: "cyan",
    },
    {
      number: "03",
      title: "Get Consultation",
      color: "orange",
    },
    {
      number: "04",
      title: "Get Care & Relief",
      color: "blue",
    },
  ];

  const colorMap = {
    purple: { border: "border-purple-300", text: "text-purple-600" },
    cyan: { border: "border-cyan-300", text: "text-cyan-600" },
    orange: { border: "border-orange-300", text: "text-orange-600" },
    blue: { border: "border-blue-300", text: "text-blue-600" },
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Activity className="w-6 h-6 text-purple-600" />
            <span className="text-purple-600 font-medium uppercase text-sm tracking-wide">
              OUR WORKING PROCESS
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            How do we work?
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const colorClass = colorMap[step.color as keyof typeof colorMap];
            return (
              <div
                key={index}
                className="text-center relative p-4 hover:bg-gray-50 rounded-2xl transition"
              >
                <div
                  className={`w-24 h-24 mx-auto mb-6 rounded-full border-4 border-dashed ${colorClass.border} flex items-center justify-center bg-white`}
                >
                  <span className={`text-2xl font-bold ${colorClass.text}`}>
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-700">
                  {step.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
