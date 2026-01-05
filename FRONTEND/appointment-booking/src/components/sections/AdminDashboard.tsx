"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, Users, UserCheck, Calendar, Edit2, Trash2, Eye, Menu, Filter, TrendingUp, TrendingDown, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

// Types
type Doctor = {
    _id: string;
    name: string;
    email: string;
    role: string[];
    details?: {
      specialization: string;
      education: string;
      consultationFee: number;
      experience: number;
      image?: string;
      enabled: boolean;
      cityId: string;
    };
  };

type City = {
  _id: string;
  name: string;
};

type SortableColumn = 'name' | 'specialization' | 'consultationFee';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// API Service
class ApiService {
  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  static async getDoctors(params?: { specialization?: string; name?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.specialization) queryParams.append('specialization', params.specialization);
    if (params?.name) queryParams.append('name', params.name);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/doctors?${queryParams}`, {
      credentials: 'include',
      headers: this.getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch doctors');
    return response.json();
  }

  static async getCities() {
    const response = await fetch(`${API_BASE_URL}/api/admin/cities`, {
      credentials: 'include',
      headers: this.getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch cities');
    return response.json();
  }

  static async addDoctor(doctorData: FormData) {
    const response = await fetch(`${API_BASE_URL}/api/admin/doctors/add`, {
      method: 'POST',
      credentials: 'include',
      body: doctorData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add doctor');
    }
    
    return response.json();
  }

  static async toggleDoctorStatus(doctorId: string, enable: boolean) {
    const endpoint = enable ? 'enable' : 'disable';
    const response = await fetch(`${API_BASE_URL}/api/admin/doctors/${doctorId}/${endpoint}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: this.getHeaders()
    });
    
    if (!response.ok) throw new Error(`Failed to ${endpoint} doctor`);
    return response.json();
  }

  static async deleteDoctor(doctorId: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/doctors/${doctorId}/delete`, {
      method: 'DELETE',
      credentials: 'include',
      headers: this.getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete doctor');
    return response.json();
  }

  static async updateDoctor(doctorId: string, doctorData: any) {
    console.log('🔄 SENDING UPDATE REQUEST:', {
      doctorId,
      doctorData,
      specialization: doctorData.specialization
    });
  
    const response = await fetch(`${API_BASE_URL}/api/admin/doctors/${doctorId}/update`, {
      method: 'PUT',
      credentials: 'include',
      headers: this.getHeaders(),
      body: JSON.stringify(doctorData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ UPDATE ERROR:', error);
      throw new Error(error.message || 'Failed to update doctor');
    }
    
    const result = await response.json();
    console.log('✅ UPDATE SUCCESS:', result);
    return result;
  }
}

// Add Doctor Modal Component
const AddDoctorModal = ({ isOpen, onClose, onAdd, cities }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (data: FormData) => void;
  cities: City[];
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    education: '',
    consultationFee: '',
    cityId: '',
    experience: ''
  });
  const [image, setImage] = useState<File | null>(null);

  const specializations = [
    "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic",
    "Pediatrician", "General Medicine", "Gynecologist", "Psychiatrist"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (image) data.append('image', image);
    onAdd(data);
    onClose();
    setFormData({
      name: '',
      email: '',
      password: '',
      specialization: '',
      education: '',
      consultationFee: '',
      cityId: '',
      experience: ''
    });
    setImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 mt-2">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Add New Doctor</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Specialization</label>
              <Select value={formData.specialization} onValueChange={(value) => setFormData({...formData, specialization: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          < div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Education</label>
              <Input
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Experience</label>
              <Input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Consultation Fee</label>
              <Input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Select value={formData.cityId} onValueChange={(value) => setFormData({...formData, cityId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city._id} value={city._id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Profile Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Add Doctor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Doctor Modal Component
const EditDoctorModal = ({ 
  isOpen, 
  onClose, 
  onUpdate, 
  doctor,
  cities,
  cityMap
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onUpdate: (doctorId: string, data: any) => void;
  doctor: Doctor | null;
  cities: City[];
  cityMap: Record<string, string>;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    education: '',
    consultationFee: '',
    cityId: '',
    enabled: true,
    experience: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const specializations = [
    "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic",
    "Pediatrician", "General Medicine", "Gynecologist", "Psychiatrist"
  ];

  // Load doctor data when modal opens
  useEffect(() => {
    if (isOpen && doctor) {
      console.log('🔍 EDIT MODAL - FULL DOCTOR DATA:', JSON.stringify(doctor, null, 2));
      
      const specialization = doctor.details?.specialization || '';
      const education = doctor.details?.education || '';
      const consultationFee = doctor.details?.consultationFee || 0;
      const cityId = doctor.details?.cityId || '';
      const enabled = doctor.details?.enabled !== false;
      const experience= doctor.details?.experience || 0;
      const newFormData = {
        name: doctor.name || '',
        email: doctor.email || '',
        specialization: specialization,
        education: education,
        consultationFee: consultationFee.toString(),
        cityId: cityId,
        enabled: enabled,
        experience: experience.toString()
      };
      
      console.log('📝 FINAL FORM DATA:', newFormData);
      console.log('🎯 Specialization value being set:', specialization);
      console.log('🏙️ City ID being set:', cityId);
      setFormData(newFormData);
    }
  }, [isOpen, doctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    console.log('🚀 SUBMITTING FORM DATA:', formData);

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        specialization: formData.specialization,
        education: formData.education,
        consultationFee: Number(formData.consultationFee),
        cityId: formData.cityId,
        enabled: formData.enabled,
        experience: formData.experience || 0,
      };

      console.log('📤 SENDING UPDATE DATA TO BACKEND:', updateData);
      
      await onUpdate(doctor._id, updateData);
      onClose();
      setImage(null);
    } catch (error) {
      console.error('❌ UPDATE FAILED:', error);
      alert('Failed to update doctor: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !doctor) return null;

  // Get city name for display
  const currentCity = cities.find(c => c._id === formData.cityId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Edit Doctor</h3>
          <p className="text-sm text-gray-600 mt-1">Update doctor information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Specialization *</label>
              <Select 
                value={formData.specialization || ""} 
                onValueChange={(value) => {
                  console.log('🎯 Specialization selected:', value);
                  setFormData({...formData, specialization: value});
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.specialization && (
                <p className="text-xs text-green-600 mt-1">✓ Current: {formData.specialization}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={formData.enabled ? "enabled" : "disabled"} onValueChange={(value) => setFormData({...formData, enabled: value === "enabled"})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Education</label>
              <Input
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Consultation Fee</label>
              <Input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Select 
                value={formData.cityId || ""} 
                onValueChange={(value) => {
                  console.log('🏙️ City selected:', value);
                  setFormData({...formData, cityId: value});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city._id} value={city._id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentCity && (
                <p className="text-xs text-green-600 mt-1">✓ Current: {currentCity.name}</p>
              )}
            </div> */}
            <div>
  <label className="block text-sm font-medium mb-2">City</label>
  <Select 
    value={formData.cityId} 
    onValueChange={(value) => {
      console.log('🏙️ City selected:', value);
      setFormData({...formData, cityId: value});
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select city">
        {formData.cityId && currentCity ? currentCity.name : "Select city"}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      {cities.map(city => (
        <SelectItem key={city._id} value={city._id}>{city.name}</SelectItem>
      ))}
    </SelectContent>
  </Select>
  {currentCity && (
    <p className="text-xs text-green-600 mt-1">✓ Current: {currentCity.name}</p>
  )}
</div>
            <div>
              <label className="block text-sm font-medium mb-2">Profile Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600" disabled={loading}>
              {loading ? "Updating..." : "Update Doctor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const { user, logout } = useAuth();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortableColumn>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // City lookup map for O(1) access - much better than looping through array
  const [cityMap, setCityMap] = useState<Record<string, string>>({});

  const previousTabRef = useRef(activeTab);

  // Load cities
  const loadCities = useCallback(async () => {
    setLoadingCities(true);
    try {
      const data = await ApiService.getCities();
      console.log('🏙️ LOADED CITIES:', data);
      setCities(data);
      
      // Create a lookup map: { cityId: cityName } for O(1) access
      const map: Record<string, string> = {};
      data.forEach((city: City) => {
        map[city._id] = city.name;
      });
      setCityMap(map);
      console.log('📍 CITY MAP CREATED:', map);
    } catch (error) {
      console.error('Failed to load cities:', error);
      setError('Failed to load cities');
    }
    setLoadingCities(false);
  }, []);

  // Load all doctors function
  const loadAllDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const data = await ApiService.getDoctors();
      console.log('📋 LOADED ALL DOCTORS:', data);
      setAllDoctors(data);
      setFilteredDoctors(data);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load doctors');
      console.error('Failed to load doctors:', error);
    }
    setLoadingDoctors(false);
  }, []);

  // Apply filters to doctors list
  const applyFilters = useCallback(() => {
    const filtered = allDoctors.filter((doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedSpecialization !== "all" ? doc.details?.specialization === selectedSpecialization : true)
    );
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  }, [allDoctors, searchQuery, selectedSpecialization]);

  // Load cities and doctors on component mount
  useEffect(() => {
    loadCities();
    loadAllDoctors();
  }, [loadCities, loadAllDoctors]);

  // Apply filters whenever search query or specialization changes
  useEffect(() => {
    if (allDoctors.length > 0) {
      applyFilters();
    }
  }, [searchQuery, selectedSpecialization, allDoctors, applyFilters]);

  // Add doctor handler
  const handleAddDoctor = async (doctorData: FormData) => {
    try {
      await ApiService.addDoctor(doctorData);
      await loadAllDoctors();
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add doctor');
    }
  };

  // Update doctor handler
  const handleUpdateDoctor = async (doctorId: string, doctorData: any) => {
    console.log('🔄 UPDATE DOCTOR CALLED:', {
      doctorId,
      doctorData
    });
    
    try {
      const result = await ApiService.updateDoctor(doctorId, doctorData);
      console.log('✅ UPDATE SUCCESSFUL:', result);
      await loadAllDoctors();
      setError(null);
    } catch (error) {
      console.error('❌ UPDATE FAILED:', error);
      setError(error instanceof Error ? error.message : 'Failed to update doctor');
      throw error;
    }
  };

  // Toggle doctor status
  const toggleDoctorStatus = async (doctorId: string, currentStatus: boolean) => {
    try {
      await ApiService.toggleDoctorStatus(doctorId, !currentStatus);
      await loadAllDoctors();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update doctor status');
    }
  };

  // Delete doctor
  const deleteDoctor = async (doctorId: string) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      try {
        await ApiService.deleteDoctor(doctorId);
        await loadAllDoctors();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete doctor');
      }
    }
  };

  // Edit doctor handler
  const handleEditDoctor = async (doctor: Doctor) => {
    console.log('✏️ EDIT DOCTOR CLICKED:', {
      doctor,
      details: doctor.details,
      specialization: doctor.details?.specialization,
      cityId: doctor.details?.cityId
    });
    
    setEditingDoctor(doctor);
    setShowEditModal(true);
  };

  // Get city name by ID - now O(1) instead of O(n)
  const getCityName = (cityId: string) => {
    return cityMap[cityId] || cityId || 'N/A';
  };

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setShowMobileMenu(false);
      } else {
        setSidebarOpen(true);
        setShowMobileMenu(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle tab transitions
  useEffect(() => {
    previousTabRef.current = activeTab;
  }, [activeTab]);

  // Get placeholder image URL
  const getPlaceholderImage = (size: number = 40) => {
    return `https://via.placeholder.com/${size}x${size}/007bff/ffffff?text=MD`;
  };

  // Use allDoctors for dashboard stats
  const specializations = [...new Set(allDoctors.map(doc => doc.details?.specialization).filter(Boolean))] as string[];

  // Filter and sort doctors for the doctors list only
  const filteredAndSortedDoctors = filteredDoctors
    .sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch(sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'specialization':
          aValue = a.details?.specialization || '';
          bValue = b.details?.specialization || '';
          break;
        case 'consultationFee':
          aValue = a.details?.consultationFee || 0;
          bValue = b.details?.consultationFee || 0;
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Pagination for doctors list
  const totalPages = Math.ceil(filteredAndSortedDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredAndSortedDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Navigation items
  const navItems = [
    { name: "Overview", icon: Users },
    { name: "Doctors", icon: UserCheck }
  ];

  // Stats data
  const statsData = [
    { 
      title: "Total Doctors", 
      value: allDoctors.length.toString(), 
      change: "+2 This Month", 
      trend: "up" as const, 
      color: "bg-gradient-to-r from-blue-500 to-blue-600", 
      icon: Users 
    },
    { 
      title: "Active Doctors", 
      value: allDoctors.filter(d => d.details?.enabled !== false).length.toString(), 
      change: "Currently Working", 
      trend: "up" as const, 
      color: "bg-gradient-to-r from-green-500 to-green-600", 
      icon: UserCheck 
    },
    { 
      title: "Specializations", 
      value: specializations.length.toString(), 
      change: "Available Fields", 
      trend: "up" as const, 
      color: "bg-gradient-to-r from-purple-500 to-purple-600", 
      icon: Calendar 
    }
  ];

  // Handle sort
  const handleSort = (column: SortableColumn) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Calculate specialization statistics
  const specializationStats = specializations.map(spec => ({
    name: spec,
    count: allDoctors.filter(doc => doc.details?.specialization === spec).length
  })).filter(stat => stat.count > 0);

  // Tab transition direction
  const getTabDirection = () => {
    const previousIndex = navItems.findIndex(item => item.name === previousTabRef.current);
    const currentIndex = navItems.findIndex(item => item.name === activeTab);
    return currentIndex > previousIndex ? 'slide-left' : 'slide-right';
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Handle tab change and close mobile menu
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const renderOverview = () => (
    <div className={`space-y-6 animate-in ${getTabDirection()} duration-500 ease-in-out`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {statsData.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={20} />
              </div>
              <div className="flex items-center">
                {stat.trend === 'up' ? (
                  <TrendingUp size={16} className="text-green-500 mr-1 animate-pulse" />
                ) : (
                  <TrendingDown size={16} className="text-gray-400 mr-1" />
                )}
              </div>
            </div>
            <h3 className="text-xs lg:text-sm text-gray-500 mb-1 transition-colors duration-300 group-hover:text-gray-700">
              {stat.title}
            </h3>
            <p className="text-xl lg:text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {stat.value}
            </p>
            <p className={`text-xs lg:text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-gray-600'} transition-all duration-300 group-hover:translate-x-1`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Specialization Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="mr-2 text-blue-500" />
            Specialization Distribution
          </h3>
          <div className="space-y-3">
            {specializationStats.map((stat, index) => (
              <div 
                key={stat.name} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-sm font-medium transition-colors duration-200 hover:text-blue-600">
                  {stat.name}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(stat.count / allDoctors.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 font-medium">{stat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 text-green-500" />
            Recent Doctor Additions
          </h3>
          <div className="space-y-3">
            {allDoctors
              .slice(0, 3)
              .map((doctor, index) => (
                <div 
                  key={doctor._id} 
                  className="flex items-center space-x-3 p-3 hover:bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg transition-all duration-300 transform hover:scale-[1.02] group cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <img 
                      src={doctor.details?.image || getPlaceholderImage(40)} 
                      alt={doctor.name} 
                      className="w-10 h-10 rounded-full transition-transform duration-300 group-hover:scale-110" 
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      doctor.details?.enabled !== false ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm transition-colors duration-200 group-hover:text-blue-600">
                      {doctor.name}
                    </p>
                    <p className="text-xs text-gray-500">{doctor.details?.specialization}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoctors = () => (
    <div className={`space-y-6 animate-in ${getTabDirection()} duration-500 ease-in-out`}>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
            <SelectTrigger className="w-full sm:w-[250px] transition-all duration-300 hover:shadow-md">
              <SelectValue placeholder="Filter by specialization" />
            </SelectTrigger>
            <SelectContent className="animate-in zoom-in-95 duration-200">
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortableColumn)}>
            <SelectTrigger className="w-full sm:w-[200px] transition-all duration-300 hover:shadow-md">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="animate-in zoom-in-95 duration-200">
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="specialization">Specialization</SelectItem>
              <SelectItem value="consultationFee">Consultation Fee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center">
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus size={16} className="mr-2" /> Add Doctor
          </Button>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold flex items-center">
            <UserCheck className="mr-2 text-blue-500" />
            All Doctors ({filteredAndSortedDoctors.length})
            {loadingDoctors && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  { key: 'name', label: 'Doctor' },
                  { key: 'specialization', label: 'Specialization' },
                  { key: 'city', label: 'City' },
                  { key: 'consultationFee', label: 'Fee' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' }
                ].map(({ key, label }) => (
                  <th 
                    key={key}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-200 transition-all duration-200 group"
                    onClick={() => key !== 'status' && key !== 'actions' && key !== 'city' && handleSort(key as SortableColumn)}
                  >
                    <div className="flex items-center">
                      {label}
                      {key !== 'status' && key !== 'actions' && key !== 'city' && (
                        <div className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {sortBy === key ? (
                            sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronUp size={14} className="text-gray-300" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDoctors.map((doctor, index) => (
                <tr 
                  key={doctor._id} 
                  className="hover:bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-300 transform hover:scale-[1.01]"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center group cursor-pointer">
                      <div className="relative">
                        <img 
                          src={doctor.details?.image || getPlaceholderImage(40)} 
                          alt={doctor.name} 
                          className="w-10 h-10 rounded-full mr-3 transition-transform duration-300 group-hover:scale-110" 
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          doctor.details?.enabled !== false ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
                          {doctor.name}
                        </div>
                        <div className="text-sm text-gray-500">{doctor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium transition-all duration-200 hover:bg-blue-200">
                      {doctor.details?.specialization || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 font-medium">
                      {doctor.details?.cityId ? getCityName(doctor.details.cityId) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${doctor.details?.consultationFee || 0}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleDoctorStatus(doctor._id, doctor.details?.enabled !== false)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                        doctor.details?.enabled !== false
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {doctor.details?.enabled !== false ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110 group">
                        <Eye size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                      </button>
                      <button 
                        onClick={() => handleEditDoctor(doctor)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110 group"
                      >
                        <Edit2 size={16} className="text-gray-400 group-hover:text-green-600 transition-colors duration-200" />
                      </button>
                      <button 
                        onClick={() => deleteDoctor(doctor._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110 group"
                      >
                        <Trash2 size={16} className="text-gray-400 group-hover:text-red-600 transition-colors duration-200" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedDoctors.length === 0 && !loadingDoctors && (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters or add a new doctor.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t gap-4 bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedDoctors.length)} of {filteredAndSortedDoctors.length} doctors
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="transition-all duration-200 hover:scale-105"
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10 transition-all duration-200 hover:scale-105"
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="transition-all duration-200 hover:scale-105"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      <AddDoctorModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddDoctor}
        cities={cities}
      />

      {/* Edit Doctor Modal */}
      <EditDoctorModal 
        isOpen={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setEditingDoctor(null);
        }}
        onUpdate={handleUpdateDoctor}
        doctor={editingDoctor}
        cities={cities}
        cityMap={cityMap}
      />
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 relative">
      {/* Mobile Menu Button */}
      {isMobile && !showMobileMenu && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMobileMenu}
            className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-full w-12 h-12 transition-all duration-300 hover:scale-110 hover:bg-white"
          >
            <Menu size={20} />
          </Button>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 animate-in fade-in duration-300"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
              showMobileMenu ? 'translate-x-0' : '-translate-x-full'
            }`
          : `relative ${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300`
        } 
        h-full bg-white/95 backdrop-blur-lg shadow-2xl border-r border-gray-200/50 overflow-hidden
      `}>
        
        {/* Logo */}
        <div className="p-6 border-b border-gray-200/50">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">Doctor Management System</p>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => handleTabChange(item.name)}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-300 transform hover:scale-105 group ${
                  activeTab === item.name
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border-l-4 border-blue-500 shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50/50 hover:text-gray-900'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon 
                  size={18} 
                  className={`mr-3 transition-all duration-300 ${
                    activeTab === item.name ? 'text-blue-500 scale-110' : 'text-gray-400 group-hover:text-blue-400'
                  }`} 
                />
                <span className="font-medium">{item.name}</span>
                {activeTab === item.name && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-300 transform hover:scale-105 group text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-hidden flex flex-col transition-all duration-300 ${
        isMobile ? 'w-full' : ''
      }`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 md:px-6 py-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className={`${isMobile ? 'ml-16' : ''}`}>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {activeTab === "Overview" ? "Dashboard Overview" : "Doctor Management"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {activeTab === "Overview" 
                  ? "Monitor your medical team performance" 
                  : "Manage doctors and their specializations"
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200 group-hover:text-blue-500" />
                <Input
                  placeholder="Search doctors..."
                  className="pl-10 w-48 md:w-64 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:scale-105"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === "Overview" && renderOverview()}
            {activeTab === "Doctors" && renderDoctors()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;