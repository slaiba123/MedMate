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
import { Suspense } from "react";
import AppointmentFormClient from "./AppointmentFormClient";

export default function AppointmentFormPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <AppointmentFormClient />
    </Suspense>
  );
}
