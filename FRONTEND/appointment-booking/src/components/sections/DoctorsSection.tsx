"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  education: string;
  image?: string;
}

export default function DoctorsSection() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/patient/doctors`
        );
        setDoctors(res.data.doctors || res.data); // adapt if your backend returns { doctors: [...] }
      } catch (err: any) {
        console.error("❌ Failed to fetch doctors:", err.message);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <section className="py-12 text-center">
        <p className="text-gray-500 animate-pulse">Loading doctors...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 text-center">
        <p className="text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Header with button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Meet Our Specialists
          </h2>
          <button
            onClick={() => router.push("/Doctors")}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-[#a280ff] text-white rounded-lg hover:scale-105 transition-transform"
          >
            View All Doctors
          </button>
        </div>

        {/* Doctors Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {doctors.slice(0, 4).map((doc) => (
            <div
              key={doc._id}
              className="relative group rounded-xl overflow-hidden shadow-md"
            >
              <img
                src={doc.details.image || "/default-doctor.jpg"}
                alt={doc.name}
                className="w-full h-64 object-cover transform group-hover:scale-105 transition"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center text-center text-white p-4 transition">
                <h3 className="text-lg font-semibold">{doc.name}</h3>
                <p className="text-sm">{doc.specialization}</p>
                <p className="text-sm italic">{doc.details.education}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
