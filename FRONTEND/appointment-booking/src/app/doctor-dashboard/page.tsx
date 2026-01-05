"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Calendar, Users, UserCheck, Bell, Menu, X, 
  Clock, CheckCircle, XCircle, AlertCircle, LogOut,
  TrendingUp, TrendingDown, Trash2, Edit, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

// 🔥 ADD THIS RIGHT AFTER IMPORTS
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
axios.defaults.withCredentials = true; // CRITICAL for cookies!

// Types
type Appointment = {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
  };
  doctorId: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "missed";
  reason?: string;
};

type DoctorStats = {
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  missedAppointments: number;
  nextAppointment?: {
    patientId: { name: string };
    startTime: string;
    endTime: string;
  };
};

type AvailabilitySlot = {
  dayOfWeek: string; // Changed from number to string
  startTime: number;
  endTime: number;
};

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout, isDoctor, getDoctorId } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isDoctor()) {
        alert('Access denied. Doctor credentials required.');
        router.push('/login');
      }
    }
  }, [user, authLoading, isDoctor, router]);

  // Fetch doctor stats
  const fetchStats = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) return;

    try {
      const response = await axios.get(`/doctors/${doctorId}/stats`);
      setStats(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        console.error('Error fetching stats:', err);
        setError("Failed to load statistics");
      }
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/doctors/${doctorId}/appointments`);
      setAppointments(response.data);
      setError("");
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        console.error('Error fetching appointments:', err);
        setError("Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch availability
  const fetchAvailability = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) return;

    try {
      const response = await axios.get(`/doctors/${doctorId}/availability`);
      setAvailability(response.data.availability || []);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await axios.patch(`/doctors/appointments/${appointmentId}/status`, { status });
      setShowStatusDropdown(null);
      await Promise.all([fetchAppointments(), fetchStats()]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        console.error('Error updating appointment:', err);
        alert("Failed to update appointment status");
      }
    }
  };

  // Delete appointment
  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      await axios.delete(`/doctors/appointments/${appointmentId}`);
      await Promise.all([fetchAppointments(), fetchStats()]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        console.error('Error deleting appointment:', err);
        alert("Failed to delete appointment");
      }
    }
  };

  // Save availability
  const saveAvailability = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) return;

    try {
      // Remove duplicates by keeping only the last slot for each day
      const uniqueAvailability = availability.reduce((acc, slot) => {
        const existingIndex = acc.findIndex(s => s.dayOfWeek === slot.dayOfWeek);
        if (existingIndex !== -1) {
          acc[existingIndex] = slot; // Replace with latest
        } else {
          acc.push(slot);
        }
        return acc;
      }, [] as AvailabilitySlot[]);

      await axios.post(`/doctors/${doctorId}/availability`, { availability: uniqueAvailability });
      alert("Availability saved successfully!");
      setShowAvailabilityModal(false);
      await fetchAvailability();
    } catch (err: any) {
      console.error('Error saving availability:', err);
      alert("Failed to save availability");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Initial data fetch
  useEffect(() => {
    if (!authLoading && user && isDoctor()) {
      fetchStats();
      fetchAppointments();
      fetchAvailability();
      
      const interval = setInterval(() => {
        fetchStats();
        fetchAppointments();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [authLoading, user]);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      missed: 'bg-orange-100 text-orange-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircle size={16} className="text-green-600" />,
      cancelled: <XCircle size={16} className="text-red-600" />,
      missed: <AlertCircle size={16} className="text-orange-600" />
    };
    return icons[status as keyof typeof icons] || <Clock size={16} className="text-blue-600" />;
  };

  const getDayName = (day: number | string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return typeof day === 'number' ? days[day] : day;
  };

  const getDayNumber = (dayName: string): number => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
  };

  // Get today's available slots
  const getTodayAvailability = () => {
    const today = new Date().getDay(); // 0-6 (Sunday-Saturday)
    const todayName = getDayName(today);
    return availability.filter(slot => slot.dayOfWeek === todayName);
  };

  // Initialize week availability (all 7 days)
  const initializeWeekAvailability = () => {
    const weekSchedule: AvailabilitySlot[] = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let day = 0; day < 7; day++) {
      weekSchedule.push({ dayOfWeek: dayNames[day], startTime: 9, endTime: 17 });
    }
    setAvailability(weekSchedule);
  };

  const updateWeekSlot = (day: number, field: 'startTime' | 'endTime', value: string) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[day];
    
    // Remove all slots for this day first to avoid duplicates
    const filtered = availability.filter(slot => slot.dayOfWeek !== dayName);
    
    // Find if there was an existing slot
    const existingSlot = availability.find(slot => slot.dayOfWeek === dayName);
    
    // Create the updated slot
    const newSlot = {
      dayOfWeek: dayName,
      startTime: field === 'startTime' ? parseInt(value) : (existingSlot?.startTime ?? 9),
      endTime: field === 'endTime' ? parseInt(value) : (existingSlot?.endTime ?? 17)
    };
    
    // Add the new slot
    setAvailability([...filtered, newSlot]);
  };

  const filteredAppointments = appointments.filter(appt =>
    appt.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(appt => appt.startTime?.startsWith(today));

  const upcomingAppointments = appointments
    .filter(appt => new Date(appt.startTime) > new Date() && appt.status !== 'cancelled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const navItems = [
    { name: "Overview", icon: Users },
    { name: "Appointments", icon: Calendar }
  ];

  const statusOptions: Array<"pending" | "confirmed" | "completed" | "cancelled" | "missed"> = 
    ['pending', 'confirmed', 'completed', 'cancelled', 'missed'];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="bg-white shadow-lg"
        >
          {showMobileMenu ? <X size={16} /> : <Menu size={16} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-65' : 'w-0'} ${
        showMobileMenu ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:relative z-40 h-full bg-white shadow-lg transition-all duration-300 overflow-hidden`}>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Doctor Dashboard</h1>
          <p>Be up-to-date with your commitments</p>
        </div>
        
        <nav className="p-4 space-y-1 h-[calc(100vh-200px)] overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-all ${
                  activeTab === item.name
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className="mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-sm text-gray-500">Doctor</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            size="sm"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Dr.{user?.name}</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search patients..."
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Bell size={16} />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {activeTab === "Overview" && (
            <div className="space-y-6">
              {/* Availability Edit Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Settings size={18} />
                  <span>Manage Availability</span>
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <Calendar size={24} />
                    </div>
                    <TrendingUp size={16} className="text-green-500" />
                  </div>
                  <h3 className="text-sm text-gray-500 mb-1">Total Appointments</h3>
                  <p className="text-2xl font-bold">{stats?.totalAppointments || 0}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <UserCheck size={24} />
                    </div>
                    <Clock size={16} className="text-blue-500" />
                  </div>
                  <h3 className="text-sm text-gray-500 mb-1">Today's Appointments</h3>
                  <p className="text-2xl font-bold">{stats?.todayAppointments || 0}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <CheckCircle size={24} />
                    </div>
                    <TrendingUp size={16} className="text-green-500" />
                  </div>
                  <h3 className="text-sm text-gray-500 mb-1">Completed</h3>
                  <p className="text-2xl font-bold">{stats?.completedAppointments || 0}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                      <AlertCircle size={24} />
                    </div>
                    <TrendingDown size={16} className="text-red-500" />
                  </div>
                  <h3 className="text-sm text-gray-500 mb-1">Missed</h3>
                  <p className="text-2xl font-bold">{stats?.missedAppointments || 0}</p>
                </div>
              </div>

              {/* Next Appointment & Today's Available Slots */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stats?.nextAppointment && (
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Clock size={20} className="mr-2" />
                      Next Appointment
                    </h3>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                      <p className="text-sm opacity-90 mb-2">Patient</p>
                      <p className="text-xl font-bold mb-3">{stats.nextAppointment.patientId.name}</p>
                      <div className="flex justify-between text-sm">
                        <span>{formatDateTime(stats.nextAppointment.startTime).date}</span>
                        <span className="font-semibold">{formatDateTime(stats.nextAppointment.startTime).time}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
                    <span>Today's Available Slots</span>
                    <button
                      onClick={() => setShowAvailabilityModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getTodayAvailability().length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No availability for today</p>
                    ) : (
                      getTodayAvailability().map((slot, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="font-medium text-green-900">{slot.dayOfWeek}</span>
                          </div>
                          <span className="text-sm font-semibold text-green-700">
                            {slot.startTime}:00 - {slot.endTime}:00
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("Appointments")} className="text-blue-500">
                    View All
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {upcomingAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No upcoming appointments
                          </td>
                        </tr>
                      ) : (
                        upcomingAppointments.map(appt => {
                          const { date, time } = formatDateTime(appt.startTime);
                          return (
                            <tr key={appt._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="font-medium">{appt.patientId?.name || 'Unknown'}</div>
                                <div className="text-sm text-gray-500">{appt.patientId?.email}</div>
                              </td>
                              <td className="px-6 py-4 text-sm">{date}</td>
                              <td className="px-6 py-4 text-sm">{time}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.status)}`}>
                                  {appt.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => updateAppointmentStatus(appt._id, 'completed')}
                                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Complete"
                                  >
                                    <CheckCircle size={16} className="text-gray-400 hover:text-green-600" />
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(appt._id, 'missed')}
                                    className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                                    title="Mark as missed"
                                  >
                                    <XCircle size={16} className="text-gray-400 hover:text-orange-600" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Appointments" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-semibold">All Appointments ({filteredAppointments.length})</h3>
                  <Button onClick={() => {fetchAppointments(); fetchStats();}} variant="outline" size="sm">
                    Refresh
                  </Button>
                </div>
                
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading appointments...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAppointments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                              No appointments found
                            </td>
                          </tr>
                        ) : (
                          filteredAppointments.map(appt => {
                            const start = formatDateTime(appt.startTime);
                            const end = formatDateTime(appt.endTime);
                            return (
                              <tr key={appt._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="font-medium">{appt.patientId?.name || 'Unknown'}</div>
                                  <div className="text-sm text-gray-500">{appt.patientId?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm">{start.date}</td>
                                <td className="px-6 py-4 text-sm">{start.time}</td>
                                <td className="px-6 py-4 text-sm">{start.time} - {end.time}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(appt.status)}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.status)}`}>
                                      {appt.status}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex space-x-2 relative">
                                    <div className="relative">
                                      <button
                                        onClick={() => setShowStatusDropdown(showStatusDropdown === appt._id ? null : appt._id)}
                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Change Status"
                                      >
                                        <Edit size={16} className="text-blue-600" />
                                      </button>
                                      {showStatusDropdown === appt._id && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-10">
                                          {statusOptions.map(status => (
                                            <button
                                              key={status}
                                              onClick={() => updateAppointmentStatus(appt._id, status)}
                                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg capitalize"
                                            >
                                              {status}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => deleteAppointment(appt._id)}
                                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} className="text-red-600" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Manage Weekly Availability</h3>
              <button onClick={() => setShowAvailabilityModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Set your availability for each day of the week. Leave start and end times the same to mark a day as unavailable.
                </p>
              </div>

              {availability.length === 0 && (
                <button
                  onClick={initializeWeekAvailability}
                  className="w-full border-2 border-dashed border-blue-400 rounded-lg py-4 text-blue-600 hover:bg-blue-50 font-medium"
                >
                  + Initialize Week Schedule (9 AM - 5 PM)
                </button>
              )}

              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6].map(day => {
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const dayName = dayNames[day];
                  const daySlot = availability.find(slot => slot.dayOfWeek === dayName);
                  return (
                    <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-32 font-semibold text-gray-700">
                        {dayName}
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-1">
                        <label className="text-sm text-gray-600 w-12">From:</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={daySlot?.startTime ?? 9}
                          onChange={(e) => updateWeekSlot(day, 'startTime', e.target.value)}
                          className="border rounded-lg px-3 py-2 w-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-600">:00</span>
                      </div>

                      <div className="flex items-center space-x-2 flex-1">
                        <label className="text-sm text-gray-600 w-12">To:</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={daySlot?.endTime ?? 17}
                          onChange={(e) => updateWeekSlot(day, 'endTime', e.target.value)}
                          className="border rounded-lg px-3 py-2 w-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-600">:00</span>
                      </div>

                      <div className="text-sm text-gray-500 w-24 text-right">
                        {daySlot && daySlot.startTime !== daySlot.endTime ? (
                          <span className="text-green-600 font-medium">Active</span>
                        ) : (
                          <span className="text-gray-400">Unavailable</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end space-x-3">
              <Button
                onClick={() => setShowAvailabilityModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={saveAvailability}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Weekly Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}