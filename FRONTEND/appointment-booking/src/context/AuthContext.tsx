// // "use client";

// // import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
// // import axios from "axios";

// // axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
// // axios.defaults.withCredentials = true;

// // interface User {
// //   _id: string;
// //   name: string;
// //   email: string;
// //   role: string[];
// // }

// // interface AuthContextType {
// //   user: User | null;
// //   loading: boolean;
// //   login: (email: string, password: string) => Promise<void>;
// //   logout: () => Promise<void>;
// // }

// // const AuthContext = createContext<AuthContextType | null>(null);

// // let isRefreshing = false;
// // let failedQueue: Array<{
// //   resolve: (value?: any) => void;
// //   reject: (reason?: any) => void;
// // }> = [];

// // const processQueue = (error: any = null) => {
// //   failedQueue.forEach(prom => {
// //     if (error) {
// //       prom.reject(error);
// //     } else {
// //       prom.resolve();
// //     }
// //   });
// //   failedQueue = [];
// // };

// // export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
// //   const [user, setUser] = useState<User | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

// //   // 🔹 Proactive token refresh function
// //   const refreshToken = useCallback(async () => {
// //     if (isRefreshing) {
// //       console.log('⏳ Already refreshing, skipping...');
// //       return;
// //     }

// //     isRefreshing = true;
// //     console.log('🔄 Proactively refreshing token...');

// //     try {
// //       await axios.post("/auth/refresh", {});
// //       console.log('✅ Token refreshed successfully');
      
// //       // Schedule next refresh (refresh at 1.5 minutes for 2-minute tokens)
// //       scheduleTokenRefresh();
// //     } catch (error: any) {
// //       console.error('❌ Proactive refresh failed:', error.response?.data);
// //       // Clear timer and log out user
// //       clearRefreshTimer();
// //       setUser(null);
      
// //       if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
// //         window.location.href = '/login';
// //       }
// //     } finally {
// //       isRefreshing = false;
// //     }
// //   }, []);

// //   // 🔹 Schedule the next token refresh
// //   const scheduleTokenRefresh = useCallback(() => {
// //     // Clear existing timer
// //     clearRefreshTimer();

// //     // Access token expires in 15 minutes (900,000 ms)
// //     // Refresh at 14min minutes  to be safe
// //     const refreshInterval = 14* 60 * 1000; // 14 mins

// //     console.log(`⏰ Scheduling token refresh in ${refreshInterval / 1000 / 60} minutes`);
    
// //     refreshTimerRef.current = setTimeout(() => {
// //       refreshToken();
// //     }, refreshInterval);
// //   }, [refreshToken]);

// //   // 🔹 Clear refresh timer
// //   const clearRefreshTimer = useCallback(() => {
// //     if (refreshTimerRef.current) {
// //       clearTimeout(refreshTimerRef.current);
// //       refreshTimerRef.current = null;
// //       console.log('🛑 Refresh timer cleared');
// //     }
// //   }, []);

// //   // 🔹 Fetch current user
// //   const fetchUser = useCallback(async () => {
// //     console.log('🔍 Fetching user...');
// //     try {
// //       const res = await axios.get("/auth/me");
// //       console.log('✅ User fetched:', res.data.user);
// //       setUser(res.data.user);
      
// //       // Start the refresh timer after successful user fetch
// //       scheduleTokenRefresh();
      
// //       return true;
// //     } catch (err: any) {
// //       console.error('❌ Fetch user failed:', err.response?.status, err.response?.data);
// //       if (err.response?.status !== 401) {
// //         setUser(null);
// //       }
// //       return false;
// //     } finally {
// //       console.log('🏁 Setting loading to FALSE');
// //       setLoading(false);
// //     }
// //   }, [scheduleTokenRefresh]);

// //   // 🔄 GLOBAL AUTOMATIC REFRESH INTERCEPTOR (Fallback)
// //   useEffect(() => {
// //     const interceptor = axios.interceptors.response.use(
// //       (response) => response,
// //       async (error) => {
// //         const originalRequest = error.config;

// //         if (originalRequest.url?.includes('/auth/refresh')) {
// //           console.error('🔴 Refresh token endpoint failed');
// //           clearRefreshTimer();
// //           setUser(null);
// //           setLoading(false);
// //           return Promise.reject(error);
// //         }

// //         if (originalRequest.url?.includes('/auth/login')) {
// //           return Promise.reject(error);
// //         }

// //         if (error.response?.status === 401 && !originalRequest._retry) {
// //           console.log('🔄 401 detected, attempting refresh...');
          
// //           if (isRefreshing) {
// //             console.log('⏳ Already refreshing, queueing request...');
// //             return new Promise((resolve, reject) => {
// //               failedQueue.push({ resolve, reject });
// //             })
// //               .then(() => axios(originalRequest))
// //               .catch(err => Promise.reject(err));
// //           }

// //           originalRequest._retry = true;
// //           isRefreshing = true;

// //           try {
// //             console.log('🔥 Calling /auth/refresh...');
// //             await axios.post("/auth/refresh", {});
// //             console.log('✅ Refresh successful');
            
// //             processQueue();
            
// //             // Reschedule the next refresh
// //             scheduleTokenRefresh();
            
// //             return axios(originalRequest);
// //           } catch (refreshError: any) {
// //             console.error('❌ Refresh failed:', refreshError.response?.data);
// //             processQueue(refreshError);
// //             clearRefreshTimer();
// //             setUser(null);
// //             setLoading(false);
            
// //             if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
// //               console.log('🚪 Redirecting to login...');
// //               window.location.href = '/login';
// //             }
            
// //             return Promise.reject(refreshError);
// //           } finally {
// //             isRefreshing = false;
// //           }
// //         }

// //         return Promise.reject(error);
// //       }
// //     );

// //     return () => {
// //       axios.interceptors.response.eject(interceptor);
// //     };
// //   }, [scheduleTokenRefresh, clearRefreshTimer]);

// //   // Run once on mount
// //   useEffect(() => {
// //     fetchUser();
    
// //     // Cleanup timer on unmount
// //     return () => {
// //       clearRefreshTimer();
// //     };
// //   }, [fetchUser, clearRefreshTimer]);

// //   const login = async (email: string, password: string) => {
// //     console.log('🔐 Attempting login for:', email);
// //     setLoading(true);
// //     try {
// //       const loginRes = await axios.post("/auth/login", { email, password });
// //       console.log('✅ Login response:', loginRes.data);
      
// //       const userRes = await axios.get("/auth/me");
// //       console.log('✅ User data fetched:', userRes.data.user);
      
// //       setUser(userRes.data.user);
      
// //       // Start the refresh timer after successful login
// //       scheduleTokenRefresh();
// //     } catch (error: any) {
// //       console.error('❌ Login failed:', error.response?.data || error.message);
// //       throw new Error(error.response?.data?.message || "Login failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const logout = async () => {
// //     console.log('🚪 Logging out...');
// //     setLoading(true);
    
// //     // Clear the refresh timer
// //     clearRefreshTimer();
    
// //     try {
// //       await axios.post("/auth/logout", {});
// //       console.log('✅ Logout successful');
// //     } catch (error) {
// //       console.error("❌ Logout API call failed:", error);
// //     } finally {
// //       setUser(null);
// //       setLoading(false);
// //       failedQueue = [];
      
// //       if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
// //         window.location.href = '/login';
// //       }
// //     }
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, loading, login, logout }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export const useAuth = () => {
// //   const ctx = useContext(AuthContext);
// //   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
// //   return ctx;
// // };


// // "use client";

// // import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
// // import axios from "axios";

// // axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
// // axios.defaults.withCredentials = true;

// // interface User {
// //   _id: string;
// //   name: string;
// //   email: string;
// //   role: string[];
// // }

// // interface AuthContextType {
// //   user: User | null;
// //   loading: boolean;
// //   login: (email: string, password: string) => Promise<void>;
// //   logout: () => Promise<void>;
// //   isDoctor: () => boolean;
// //   isAdmin: () => boolean;
// //   getDoctorId: () => string | null;
// // }

// // const AuthContext = createContext<AuthContextType | null>(null);

// // let isRefreshing = false;
// // let failedQueue: Array<{
// //   resolve: (value?: any) => void;
// //   reject: (reason?: any) => void;
// // }> = [];

// // const processQueue = (error: any = null) => {
// //   failedQueue.forEach(prom => {
// //     if (error) {
// //       prom.reject(error);
// //     } else {
// //       prom.resolve();
// //     }
// //   });
// //   failedQueue = [];
// // };

// // export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
// //   const [user, setUser] = useState<User | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

// //   // 🔹 Proactive token refresh function
// //   const refreshToken = useCallback(async () => {
// //     if (isRefreshing) {
// //       console.log('⏳ Already refreshing, skipping...');
// //       return;
// //     }

// //     isRefreshing = true;
// //     console.log('🔄 Proactively refreshing token...');

// //     try {
// //       await axios.post("/auth/refresh", {});
// //       console.log('✅ Token refreshed successfully');
      
// //       // Schedule next refresh (refresh at 14 minutes for 15-minute tokens)
// //       scheduleTokenRefresh();
// //     } catch (error: any) {
// //       console.error('❌ Proactive refresh failed:', error.response?.data);
// //       // Clear timer and log out user
// //       clearRefreshTimer();
// //       setUser(null);
      
// //       // Clear stored data
// //       if (typeof window !== 'undefined') {
// //         localStorage.removeItem('doctorId');
// //         localStorage.removeItem('token');
// //       }
      
// //       if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
// //         window.location.href = '/login';
// //       }
// //     } finally {
// //       isRefreshing = false;
// //     }
// //   }, []);

// //   // 🔹 Schedule the next token refresh
// //   const scheduleTokenRefresh = useCallback(() => {
// //     // Clear existing timer
// //     clearRefreshTimer();

// //     // Access token expires in 15 minutes (900,000 ms)
// //     // Refresh at 14 minutes to be safe
// //     const refreshInterval = 14 * 60 * 1000; // 14 mins

// //     console.log(`⏰ Scheduling token refresh in ${refreshInterval / 1000 / 60} minutes`);
    
// //     refreshTimerRef.current = setTimeout(() => {
// //       refreshToken();
// //     }, refreshInterval);
// //   }, [refreshToken]);

// //   // 🔹 Clear refresh timer
// //   const clearRefreshTimer = useCallback(() => {
// //     if (refreshTimerRef.current) {
// //       clearTimeout(refreshTimerRef.current);
// //       refreshTimerRef.current = null;
// //       console.log('🛑 Refresh timer cleared');
// //     }
// //   }, []);

// //   // 🔹 Fetch current user
// //   const fetchUser = useCallback(async () => {
// //     console.log('🔍 Fetching user...');
// //     try {
// //       const res = await axios.get("/auth/me");
// //       console.log('✅ User fetched:', res.data.user);
// //       setUser(res.data.user);
      
// //       // Store doctor ID if user is a doctor
// //       if (res.data.user.role.includes('doctor')) {
// //         localStorage.setItem('doctorId', res.data.user._id);
// //       }
      
// //       // Start the refresh timer after successful user fetch
// //       scheduleTokenRefresh();
      
// //       return true;
// //     } catch (err: any) {
// //       console.error('❌ Fetch user failed:', err.response?.status, err.response?.data);
// //       if (err.response?.status !== 401) {
// //         setUser(null);
// //       }
// //       return false;
// //     } finally {
// //       console.log('🏁 Setting loading to FALSE');
// //       setLoading(false);
// //     }
// //   }, [scheduleTokenRefresh]);

// //   // 🔄 GLOBAL AUTOMATIC REFRESH INTERCEPTOR (Fallback)
// //   useEffect(() => {
// //     const interceptor = axios.interceptors.response.use(
// //       (response) => response,
// //       async (error) => {
// //         const originalRequest = error.config;

// //         if (originalRequest.url?.includes('/auth/refresh')) {
// //           console.error('🔴 Refresh token endpoint failed');
// //           clearRefreshTimer();
// //           setUser(null);
// //           setLoading(false);
          
// //           // Clear stored data
// //           if (typeof window !== 'undefined') {
// //             localStorage.removeItem('doctorId');
// //             localStorage.removeItem('token');
// //           }
          
// //           return Promise.reject(error);
// //         }

// //         if (originalRequest.url?.includes('/auth/login')) {
// //           return Promise.reject(error);
// //         }

// //         if (error.response?.status === 401 && !originalRequest._retry) {
// //           console.log('🔄 401 detected, attempting refresh...');
          
// //           if (isRefreshing) {
// //             console.log('⏳ Already refreshing, queueing request...');
// //             return new Promise((resolve, reject) => {
// //               failedQueue.push({ resolve, reject });
// //             })
// //               .then(() => axios(originalRequest))
// //               .catch(err => Promise.reject(err));
// //           }

// //           originalRequest._retry = true;
// //           isRefreshing = true;

// //           try {
// //             console.log('🔥 Calling /auth/refresh...');
// //             await axios.post("/auth/refresh", {});
// //             console.log('✅ Refresh successful');
            
// //             processQueue();
            
// //             // Reschedule the next refresh
// //             scheduleTokenRefresh();
            
// //             return axios(originalRequest);
// //           } catch (refreshError: any) {
// //             console.error('❌ Refresh failed:', refreshError.response?.data);
// //             processQueue(refreshError);
// //             clearRefreshTimer();
// //             setUser(null);
// //             setLoading(false);
            
// //             // Clear stored data
// //             if (typeof window !== 'undefined') {
// //               localStorage.removeItem('doctorId');
// //               localStorage.removeItem('token');
// //             }
            
// //             if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
// //               console.log('🚪 Redirecting to login...');
// //               window.location.href = '/login';
// //             }
            
// //             return Promise.reject(refreshError);
// //           } finally {
// //             isRefreshing = false;
// //           }
// //         }

// //         return Promise.reject(error);
// //       }
// //     );

// //     return () => {
// //       axios.interceptors.response.eject(interceptor);
// //     };
// //   }, [scheduleTokenRefresh, clearRefreshTimer]);

// //   // Run once on mount
// //   useEffect(() => {
// //     fetchUser();
    
// //     // Cleanup timer on unmount
// //     return () => {
// //       clearRefreshTimer();
// //     };
// //   }, [fetchUser, clearRefreshTimer]);

// //   const login = async (email: string, password: string) => {
// //     console.log('🔐 Attempting login for:', email);
// //     setLoading(true);
// //     try {
// //       const loginRes = await axios.post("/auth/login", { email, password });
// //       console.log('✅ Login response:', loginRes.data);
      
// //       const userRes = await axios.get("/auth/me");
// //       console.log('✅ User data fetched:', userRes.data.user);
      
// //       setUser(userRes.data.user);
      
// //       // Store doctor ID if user is a doctor
// //       if (userRes.data.user.role.includes('doctor')) {
// //         localStorage.setItem('doctorId', userRes.data.user._id);
// //         console.log('💼 Doctor ID stored:', userRes.data.user._id);
// //       }
      
// //       // Start the refresh timer after successful login
// //       scheduleTokenRefresh();
// //     } catch (error: any) {
// //       console.error('❌ Login failed:', error.response?.data || error.message);
// //       throw new Error(error.response?.data?.message || "Login failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const logout = async () => {
// //     console.log('🚪 Logging out...');
// //     setLoading(true);
    
// //     // Clear the refresh timer
// //     clearRefreshTimer();
    
// //     try {
// //       await axios.post("/auth/logout", {});
// //       console.log('✅ Logout successful');
// //     } catch (error) {
// //       console.error("❌ Logout API call failed:", error);
// //     } finally {
// //       setUser(null);
// //       setLoading(false);
// //       failedQueue = [];
      
// //       // Clear stored data
// //       if (typeof window !== 'undefined') {
// //         localStorage.removeItem('doctorId');
// //         localStorage.removeItem('token');
// //       }
      
// //       if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
// //         window.location.href = '/login';
// //       }
// //     }
// //   };

// //   // Helper function to check if user is a doctor
// //   const isDoctor = useCallback(() => {
// //     return user?.role?.includes('doctor') || false;
// //   }, [user]);

// //   // Helper function to check if user is an admin
// //   const isAdmin = useCallback(() => {
// //     return user?.role?.includes('admin') || false;
// //   }, [user]);

// //   // Helper function to get doctor ID
// //   const getDoctorId = useCallback(() => {
// //     if (user?.role?.includes('doctor')) {
// //       // Try localStorage first
// //       const storedId = localStorage.getItem('doctorId');
// //       if (storedId) return storedId;
      
// //       // Fall back to user ID
// //       return user._id;
// //     }
// //     return null;
// //   }, [user]);

// //   return (
// //     <AuthContext.Provider value={{ 
// //       user, 
// //       loading, 
// //       login, 
// //       logout,
// //       isDoctor,
// //       isAdmin,
// //       getDoctorId
// //     }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export const useAuth = () => {
// //   const ctx = useContext(AuthContext);
// //   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
// //   return ctx;
// // };


// "use client";

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
// } from "react";
// import axios from "axios";

// axios.defaults.baseURL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
// axios.defaults.withCredentials = true;

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string[];
// }

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   isDoctor: () => boolean;
//   isAdmin: () => boolean;
//   getDoctorId: () => string | null;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// let isRefreshing = false;
// let failedQueue: Array<{ resolve: () => void; reject: (err?: any) => void }> =
//   [];

// const processQueue = (error: any = null) => {
//   failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
//   failedQueue = [];
// };

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

//   /** 🕓 Clears existing refresh timer */
//   const clearRefreshTimer = useCallback(() => {
//     if (refreshTimerRef.current) {
//       clearTimeout(refreshTimerRef.current);
//       refreshTimerRef.current = null;
//     }
//   }, []);

//   /** ⏰ Schedules next token refresh (based on cookie token) */
//   const scheduleTokenRefresh = useCallback(() => {
//     clearRefreshTimer();
//     const interval = 14 * 60 * 1000; // 14 minutes
//     refreshTimerRef.current = setTimeout(async () => {
//       try {
//         await axios.post("/api/auth/refresh", {});
//         console.log("✅ Token auto-refreshed");
//       } catch (err) {
//         console.error("❌ Auto-refresh failed");
//         logout();
//       }
//     }, interval);
//   }, [clearRefreshTimer]);

//   /** 👤 Fetch user from cookie-authenticated session */
//   const fetchUser = useCallback(async () => {
//     try {
//       const res = await axios.get("/api/auth/me");
//       setUser(res.data.user);
//       scheduleTokenRefresh();
//     } catch {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, [scheduleTokenRefresh]);

//   /** 🧠 Run once on mount */
//   useEffect(() => {
//     fetchUser();
//     return () => clearRefreshTimer();
//   }, [fetchUser, clearRefreshTimer]);

//   /** 🔐 Login — sets cookies automatically */
//   const login = async (email: string, password: string) => {
//     setLoading(true);
//     try {
//       await axios.post("/api/auth/login", { email, password });
//       const res = await axios.get("/api/auth/me");
//       setUser(res.data.user);
//       scheduleTokenRefresh();
//     } catch (error: any) {
//       throw new Error(error.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /** 🚪 Logout — clears session cookies */
//   const logout = async () => {
//     clearRefreshTimer();
//     try {
//       await axios.post("/api/auth/logout", {});
//     } catch {}
//     setUser(null);
//     if (!window.location.pathname.includes("/login")) {
//       window.location.href = "/login";
//     }
//   };

//   /** 🧩 Helpers */
//   const isDoctor = useCallback(
//     () => user?.role?.includes("doctor") || false,
//     [user]
//   );
//   const isAdmin = useCallback(
//     () => user?.role?.includes("admin") || false,
//     [user]
//   );
//   const getDoctorId = useCallback(
//     () => (user?.role?.includes("doctor") ? user._id : null),
//     [user]
//   );

//   return (
//     <AuthContext.Provider
//       value={{ user, loading, login, logout, isDoctor, isAdmin, getDoctorId }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };


"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";

axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string; // ✅ FIXED
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isDoctor: () => boolean;
  isAdmin: () => boolean;
  getDoctorId: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const scheduleTokenRefresh = useCallback(() => {
    clearRefreshTimer();
    refreshTimerRef.current = setTimeout(async () => {
      try {
        await axios.post("/api/auth/refresh");
      } catch {
        await logout();
      }
    }, 14 * 60 * 1000);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data.user);
      scheduleTokenRefresh();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleTokenRefresh]);

  useEffect(() => {
    fetchUser();
    return clearRefreshTimer;
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await axios.post("/api/auth/login", { email, password });

      const res = await axios.get("/api/auth/me");
      if (!res.data?.user) throw new Error("Session fetch failed");

      setUser(res.data.user);
      scheduleTokenRefresh();
    } catch (err: any) {
      setUser(null);
      throw new Error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    clearRefreshTimer();
    try {
      await axios.post("/api/auth/logout");
    } catch {}
    setUser(null);
    window.location.href = "/login";
  };

  const isDoctor = () => user?.role === "doctor";
  const isAdmin = () => user?.role === "admin";
  const getDoctorId = () => (isDoctor() ? user!._id : null);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isDoctor, isAdmin, getDoctorId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
