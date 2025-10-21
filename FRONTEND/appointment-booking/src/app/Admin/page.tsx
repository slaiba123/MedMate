// FRONTEND/src/app/Admin/page.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminDashboard from "@/components/sections/AdminDashboard";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 Admin Page - Loading:', loading, 'User:', user);
    
    // Only run redirects when not loading
    if (!loading) {
      if (!user) {
        console.log('❌ No user found, redirecting to login');
        router.push("/login");
      } else if (!user.role?.includes('admin')) {
        console.log('❌ User is not admin:', user.role, 'redirecting to home');
        router.push("/");
      } else {
        console.log('✅ Admin access granted');
      }
    }
  }, [user, loading, router]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || !user.role?.includes('admin')) {
    console.log('🚫 Access denied, showing nothing while redirecting');
    return null;
  }

  // Show dashboard
  console.log('✅ Rendering AdminDashboard');
  return <AdminDashboard />;
}