// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { LoginForm } from "@/components/layout/LoginForm";

// export default function LoginPage() {
//   const { login, user, loading } = useAuth();
//   const router = useRouter();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogin = async (email: string, password: string) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       await login(email, password);
//     } catch (err: any) {
//       setError(err.message || "Login failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!loading && user) {
//       const role = user.role || [];
//       if (role.includes("admin")) {
//         router.push("/Admin");
//       } else if (role.includes("doctor")) {
//         router.push("/doctor-dashboard");
//       } else {
//         setError("Access denied. Only Doctors and Admins are allowed");
//       }
//     }
//   }, [user, loading, router]);

//   return (
//     <div>
//     <LoginForm
//       onSubmit={handleLogin}
//       isLoading={isLoading}
//       error={error}
//       title="Doctor/Admin Login"
//       subtitle="Sign in to access your medical dashboard. Only authorized Doctors and Admins are allowed."
//     />
    
// </div>
    
//   );
// }
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/layout/LoginForm";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      // user.role is guaranteed to be string[] from AuthContext
      if (user.role.includes("admin")) {
        router.push("/Admin");
      } else if (user.role.includes("doctor")) {
        router.push("/doctor-dashboard");
      } else {
        setError("Access denied. Only Doctors and Admins are allowed");
      }
    }
  }, [user, loading, router]);

  return (
    <div>
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
        title="Doctor/Admin Login"
        subtitle="Sign in to access your medical dashboard. Only authorized Doctors and Admins are allowed."
      />
    </div>
  );
}
