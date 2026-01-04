// "use client";

// import { useSearchParams } from "next/navigation";
// import AppointmentForm from "@/components/sections/AppointmentForm";

// export default function AppointmentFormPage() {
//   const searchParams = useSearchParams();
  
//   const doctorId = searchParams.get("doctorId");
//   const doctorName = searchParams.get("doctorName");
//   const specialization = searchParams.get("specialization");
//   const consultationFee = searchParams.get("consultationFee");
//   return (
//     <div className="container mx-auto px-4 py-8">
//       {doctorId ? (
//         <AppointmentForm 
//           doctorId={doctorId}
//           doctorName={doctorName || ""}
//           specialization={specialization || ""}
//           consultationFee={consultationFee || ""}
//         />
//       ) : (
//         <p className="text-center text-red-500">No doctor selected</p>
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppointmentForm from "@/components/sections/AppointmentForm";

export default function AppointmentFormPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctorName");
  const specialization = searchParams.get("specialization");
  const consultationFee = searchParams.get("consultationFee");

  // Redirect if no doctorId
  useEffect(() => {
    if (!doctorId) {
      router.push("/doctors");
    }
  }, [doctorId, router]);

  if (!doctorId) return null; // render nothing while redirecting

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
