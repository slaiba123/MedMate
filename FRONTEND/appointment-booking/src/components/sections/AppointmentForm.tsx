'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, ArrowLeft, DollarSign } from 'lucide-react';

interface AppointmentFormProps {
  doctorId?: string;
  doctorName?: string;
  specialization?: string;
  consultationFee?: string;
}

export default function AppointmentForm({ doctorId, doctorName, specialization, consultationFee }: AppointmentFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get doctor data from URL parameters if not passed as props
  const urlDoctorId = searchParams.get('doctorId');
  const urlDoctorName = searchParams.get('doctorName');
  const urlSpecialization = searchParams.get('specialization');
  const urlConsultationFee = searchParams.get('consultationFee');

  const finalDoctorId = doctorId || urlDoctorId || '';
  const finalDoctorName = doctorName || urlDoctorName || '';
  const finalSpecialization = specialization || urlSpecialization || '';
  const finalConsultationFee = parseInt(urlConsultationFee || "0");

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    notes: ''
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.appointmentDate && finalDoctorId) {
      fetchAvailableSlots(formData.appointmentDate);
    }
  }, [formData.appointmentDate, finalDoctorId]);

  const fetchAvailableSlots = async (date: string) => {
    if (!finalDoctorId) return;
    
    setLoadingSlots(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/doctors/${finalDoctorId}/slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.slots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientName.trim()) newErrors.patientName = 'Name is required';
    if (!formData.patientEmail.trim()) {
      newErrors.patientEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.patientEmail)) {
      newErrors.patientEmail = 'Email is invalid';
    }
    if (!formData.patientPhone.trim()) newErrors.patientPhone = 'Phone is required';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Date is required';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Time is required';
    if (!formData.symptoms.trim()) newErrors.symptoms = 'Symptoms are required';
    if (!finalDoctorId) newErrors.doctor = 'Doctor is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Calculate end time (assuming 30-minute slots)
      const startTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      const endTime = new Date(startTime.getTime() + 30 * 60000); // Add 30 minutes
     
      const appointmentData = {
        doctorId: finalDoctorId,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        symptoms: formData.symptoms,
        notes: formData.notes || `Appointment with Dr. ${finalDoctorName}`,
        consultationFee: finalConsultationFee // Use the actual consultation fee
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (res.ok) {
        setSubmitted(true);
        console.log('Appointment booked successfully');
        
        setTimeout(() => {
          // Redirect back to doctors page
          router.push('/Doctors');
        }, 3000);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({ submit: 'Failed to book appointment. Please try again.' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBack = () => {
    router.push('/Doctors');
  };

  if (submitted) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4 ">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Booked!</h2>
          <p className="text-gray-600 mb-4">Your appointment with Dr. {finalDoctorName} has been confirmed.</p>
          <p className="text-sm text-gray-500">You will be redirected shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-white hover:bg-white/20 rounded-full transition"
                title="Back to doctors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Book Appointment</h1>
                <p className="text-blue-100 mt-2">
                  with Dr. {finalDoctorName} - {finalSpecialization}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Doctor Information */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-800 mb-2">Doctor Information</h3>
              <p className="text-sm text-gray-600">Dr. {finalDoctorName}</p>
              <p className="text-sm text-gray-600">{finalSpecialization}</p>
              {finalConsultationFee > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm font-semibold text-green-600">
                    Consultation Fee: PKR {finalConsultationFee}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.patientName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="John Doe"
                />
              </div>
              {errors.patientName && <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>}
            </div>

            <div>
              <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="patientEmail"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.patientEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.patientEmail && <p className="mt-1 text-sm text-red-600">{errors.patientEmail}</p>}
            </div>

            <div>
              <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="patientPhone"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.patientPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="+92 300 1234567"
                />
              </div>
              {errors.patientPhone && <p className="mt-1 text-sm text-red-600">{errors.patientPhone}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    onKeyDown={(e) => e.preventDefault()}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.appointmentDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.appointmentDate && <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>}
              </div>

              <div>
                <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="appointmentTime"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    disabled={!formData.appointmentDate || loadingSlots}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.appointmentTime ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
                  >
                    <option value="">Select a time</option>
                    {loadingSlots ? (
                      <option>Loading available slots...</option>
                    ) : availableSlots.length > 0 ? (
                      availableSlots.map(slot => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))
                    ) : (
                      formData.appointmentDate && <option>No slots available</option>
                    )}
                  </select>
                </div>
                {errors.appointmentTime && <p className="mt-1 text-sm text-red-600">{errors.appointmentTime}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms / Reason for Visit *
              </label>
              <textarea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows={3}
                className={`block w-full px-3 py-2 border ${errors.symptoms ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Describe your symptoms or reason for the appointment..."
              />
              {errors.symptoms && <p className="mt-1 text-sm text-red-600">{errors.symptoms}</p>}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requirements or information we should know..."
                />
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!finalDoctorId}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}