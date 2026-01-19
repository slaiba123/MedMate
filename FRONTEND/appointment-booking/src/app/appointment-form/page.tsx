import { Suspense } from "react";
import AppointmentFormClient from "./AppointmentFormClient";

export default function AppointmentFormPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <AppointmentFormClient />
    </Suspense>
  );
}
