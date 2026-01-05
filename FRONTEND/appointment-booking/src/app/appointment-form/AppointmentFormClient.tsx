"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppointmentForm from "@/components/sections/AppointmentForm";

export default function AppointmentFormClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctorName");
  const specialization = searchParams.get("specialization");
  const consultationFee = searchParams.get("consultationFee");

  useEffect(() => {
    if (!doctorId) {
      router.push("/doctors");
    }
  }, [doctorId, router]);

  if (!doctorId) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <AppointmentForm
        doctorId={doctorId}
        doctorName={doctorName || ""}
        specialization={specialization || ""}
        consultationFee={consultationFee || ""}
      />
    </div>
  );
}
