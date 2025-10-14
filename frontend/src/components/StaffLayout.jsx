import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import StaffHeader from './StaffHeader';

const StaffLayout = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user has staff access
  if (!user || (user.role !== 'admin' && user.role !== 'support')) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <StaffSidebar />

      <div className="ml-64">
        <StaffHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;