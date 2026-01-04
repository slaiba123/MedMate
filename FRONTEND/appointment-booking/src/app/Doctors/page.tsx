// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// interface Doctor {
//   _id: string;
//   name: string;
//   specialization: string;
//   education: string;
//   image: string;
//   city: string;
//   consultationFee: number;
// }

// export default function AllDoctorsPage() {
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
//   const [specializations, setSpecializations] = useState<string[]>([]);
//   const [cities, setCities] = useState<string[]>([]);
//   const [filters, setFilters] = useState({
//     specialization: "",
//     city: "",
//   });
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch("http://localhost:4000/api/patient/doctors");
//         if (!res.ok) throw new Error("Failed to fetch doctors");

//         const data = await res.json();

//         // ✅ Map nested structure into flat Doctor objects with proper city handling
//         const formattedDoctors = data.map((doc: any) => {
//           // Handle city data properly - it might be nested in details.city or details.cityId.name
//           let city = "Unknown";
          
//           if (doc.details?.city) {
//             city = doc.details.city;
//           } else if (doc.details?.cityId?.name) {
//             city = doc.details.cityId.name;
//           } else if (doc.city) {
//             city = doc.city;
//           }

//           return {
//             _id: doc._id || doc.user?._id,
//             name: doc.name || doc.user?.name,
//             specialization: doc.details?.specialization || "Not specified",
//             education: doc.details?.education || "N/A",
//             image:
//               doc.details?.image ||
//               "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
//             city: city,
//             consultationFee: doc.details?.consultationFee || 0,
//           };
//         });

//         setDoctors(formattedDoctors);
//         setFilteredDoctors(formattedDoctors);

//         // Extract unique specializations and cities for filters
//         const uniqueSpecializations = [...new Set(formattedDoctors
//           .map(doc => doc.specialization)
//           .filter(spec => spec && spec !== "Not specified")
//         )].sort();

//         const uniqueCities = [...new Set(formattedDoctors
//           .map(doc => doc.city)
//           .filter(city => city && city !== "Unknown")
//         )].sort();

//         setSpecializations(uniqueSpecializations);
//         setCities(uniqueCities);
        
//         console.log("✅ Doctors formatted:", formattedDoctors);
//         console.log("🏙️ Available cities:", uniqueCities);
//         console.log("🎯 Available specializations:", uniqueSpecializations);
//       } catch (error) {
//         console.error("Error fetching doctors:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDoctors();
//   }, []);

//   // Apply filters whenever filters state changes
//   useEffect(() => {
//     let result = doctors;

//     if (filters.specialization) {
//       result = result.filter(doc => 
//         doc.specialization.toLowerCase().includes(filters.specialization.toLowerCase())
//       );
//     }

//     if (filters.city) {
//       result = result.filter(doc => 
//         doc.city.toLowerCase().includes(filters.city.toLowerCase())
//       );
//     }

//     setFilteredDoctors(result);
//   }, [filters, doctors]);

//   const handleFilterChange = (key: keyof typeof filters, value: string) => {
//     setFilters(prev => ({
//       ...prev,
//       [key]: value
//     }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       specialization: "",
//       city: "",
//     });
//   };

//   const handleBookAppointment = (doctor: Doctor) => {
//     // Navigate to AppointmentForm with doctor data including consultation fee
//     router.push(
//       `/appointment-form?doctorId=${doctor._id}&doctorName=${encodeURIComponent(doctor.name)}&specialization=${encodeURIComponent(doctor.specialization)}&consultationFee=${doctor.consultationFee}`
//     );
//   };

//   const hasActiveFilters = filters.specialization || filters.city;

//   return (
//     <div className="p-8 mt-16">
//       <h1 className="text-3xl text-blue-900 font-bold text-center mb-8">All Doctors</h1>

//       {/* Filter Section */}
//       <div className="mb-8 bg-white rounded-lg shadow-md p-6">
//         <div className="flex flex-col md:flex-row gap-4 items-end">
//           {/* Specialization Filter */}
//           <div className="flex-1">
//             <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
//               Specialization
//             </label>
//             <select
//               id="specialization"
//               value={filters.specialization}
//               onChange={(e) => handleFilterChange("specialization", e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               <option value="">All Specializations</option>
//               {specializations.map(spec => (
//                 <option key={spec} value={spec}>
//                   {spec}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* City Filter */}
//           <div className="flex-1">
//             <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
//               City
//             </label>
//             <select
//               id="city"
//               value={filters.city}
//               onChange={(e) => handleFilterChange("city", e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               <option value="">All Cities</option>
//               {cities.map(city => (
//                 <option key={city} value={city}>
//                   {city}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Clear Filters Button */}
//           <div>
//             <button
//               onClick={clearFilters}
//               disabled={!hasActiveFilters}
//               className={`px-4 py-2 rounded-md transition ${
//                 hasActiveFilters
//                   ? "bg-gray-500 text-white hover:bg-gray-600"
//                   : "bg-gray-200 text-gray-500 cursor-not-allowed"
//               }`}
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>

//         {/* Active Filters Info */}
//         {hasActiveFilters && (
//           <div className="mt-4 flex flex-wrap gap-2">
//             {filters.specialization && (
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                 Specialization: {filters.specialization}
//                 <button
//                   onClick={() => handleFilterChange("specialization", "")}
//                   className="ml-2 hover:text-purple-900"
//                 >
//                   ×
//                 </button>
//               </span>
//             )}
//             {filters.city && (
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                 City: {filters.city}
//                 <button
//                   onClick={() => handleFilterChange("city", "")}
//                   className="ml-2 hover:text-blue-900"
//                 >
//                   ×
//                 </button>
//               </span>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Results Count */}
//       <div className="mb-6">
//         <p className="text-gray-600">
//           Showing {filteredDoctors.length} of {doctors.length} doctors
//           {hasActiveFilters && " (filtered)"}
//         </p>
//       </div>

//       {loading ? (
//         <p className="text-center text-gray-600">Loading doctors...</p>
//       ) : filteredDoctors.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-gray-500 text-lg mb-4">No doctors found matching your criteria</p>
//           {hasActiveFilters && (
//             <button
//               onClick={clearFilters}
//               className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//             >
//               Clear Filters
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {filteredDoctors.map((doc) => (
//             <div
//               key={doc._id}
//               className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
//             >
//               <img
//                 src={doc.image}
//                 alt={doc.name}
//                 className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-300"
//               />

//               {/* Hover overlay */}
//               <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center text-center text-white p-4 transition duration-300">
//                 <h3 className="text-lg font-semibold">{doc.name}</h3>
//                 <p className="text-sm">{doc.specialization}</p>
//                 <p className="text-sm italic">{doc.education}</p>
//                 <p className="text-sm italic">{doc.city}</p>
//                 <button 
//                   onClick={() => handleBookAppointment(doc)}
//                   className="mt-3 px-3 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
//                 >
//                   Book Appointment
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  education: string;
  image: string;
  city: string;
  consultationFee: number;
}

export default function AllDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    specialization: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/patient/doctors`);
        if (!res.ok) throw new Error("Failed to fetch doctors");

        const data = await res.json();

        // ✅ Map nested structure into flat Doctor objects with proper city handling
        const formattedDoctors: Doctor[] = data.map((doc: any): Doctor => {
          // Handle city data properly - it might be nested in details.city or details.cityId.name
          let city = "Unknown";
          
          if (doc.details?.city) {
            city = doc.details.city;
          } else if (doc.details?.cityId?.name) {
            city = doc.details.cityId.name;
          } else if (doc.city) {
            city = doc.city;
          }

          return {
            _id: doc._id || doc.user?._id,
            name: doc.name || doc.user?.name,
            specialization: doc.details?.specialization || "Not specified",
            education: doc.details?.education || "N/A",
            image:
              doc.details?.image ||
              "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
            city: city,
            consultationFee: doc.details?.consultationFee || 0,
          };
        });

        setDoctors(formattedDoctors);
        setFilteredDoctors(formattedDoctors);

        // Extract unique specializations and cities for filters
        const uniqueSpecializations = [...new Set(formattedDoctors
          .map((doc: Doctor) => doc.specialization)
          .filter((spec: string) => spec && spec !== "Not specified")
        )].sort();

        const uniqueCities = [...new Set(formattedDoctors
          .map((doc: Doctor) => doc.city)
          .filter((city: string) => city && city !== "Unknown")
        )].sort();

        setSpecializations(uniqueSpecializations);
        setCities(uniqueCities);
        
        console.log("✅ Doctors formatted:", formattedDoctors);
        console.log("🏙️ Available cities:", uniqueCities);
        console.log("🎯 Available specializations:", uniqueSpecializations);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Apply filters whenever filters state changes
  useEffect(() => {
    let result = doctors;

    if (filters.specialization) {
      result = result.filter((doc: Doctor) => 
        doc.specialization.toLowerCase().includes(filters.specialization.toLowerCase())
      );
    }

    if (filters.city) {
      result = result.filter((doc: Doctor) => 
        doc.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    setFilteredDoctors(result);
  }, [filters, doctors]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      specialization: "",
      city: "",
    });
  };

  const handleBookAppointment = (doctor: Doctor) => {
    // Navigate to AppointmentForm with doctor data including consultation fee
    router.push(
      `/appointment-form?doctorId=${doctor._id}&doctorName=${encodeURIComponent(doctor.name)}&specialization=${encodeURIComponent(doctor.specialization)}&consultationFee=${doctor.consultationFee}`
    );
  };

  const hasActiveFilters = filters.specialization || filters.city;

  return (
    <div className="p-8 mt-16">
      <h1 className="text-3xl text-blue-900 font-bold text-center mb-8">All Doctors</h1>

      {/* Filter Section */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Specialization Filter */}
          <div className="flex-1">
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              id="specialization"
              value={filters.specialization}
              onChange={(e) => handleFilterChange("specialization", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec: string) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="flex-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              id="city"
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Cities</option>
              {cities.map((city: string) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className={`px-4 py-2 rounded-md transition ${
                hasActiveFilters
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Active Filters Info */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.specialization && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Specialization: {filters.specialization}
                <button
                  onClick={() => handleFilterChange("specialization", "")}
                  className="ml-2 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                City: {filters.city}
                <button
                  onClick={() => handleFilterChange("city", "")}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredDoctors.length} of {doctors.length} doctors
          {hasActiveFilters && " (filtered)"}
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading doctors...</p>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No doctors found matching your criteria</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDoctors.map((doc: Doctor) => (
            <div
              key={doc._id}
              className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
            >
              <img
                src={doc.image}
                alt={doc.name}
                className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-300"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center text-center text-white p-4 transition duration-300">
                <h3 className="text-lg font-semibold">{doc.name}</h3>
                <p className="text-sm">{doc.specialization}</p>
                <p className="text-sm italic">{doc.education}</p>
                <p className="text-sm italic">{doc.city}</p>
                <button 
                  onClick={() => handleBookAppointment(doc)}
                  className="mt-3 px-3 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}