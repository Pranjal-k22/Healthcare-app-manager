import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types/doctor';
import { getDoctors, toggleDoctorActiveStatus, deleteDoctor } from '../../services/doctorApi';
import { DoctorCard } from '../../components/doctor/DoctorCard';
import { DoctorSearchBar } from '../../components/doctor/DoctorSearchBar';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Stethoscope,
  Users,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const ManageDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isDeletingDoctor, setIsDeletingDoctor] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  const fetchDoctorsList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDoctors({
        search: searchTerm,
        specialization: selectedSpecialization,
        includeInactive: true,
      });
      setDoctors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctors list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctorsList();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedSpecialization]);

  const handleToggleStatus = async (doctorId: string, newStatus: boolean) => {
    try {
      setIsStatusUpdating(true);
      setError(null);
      setSuccessMsg(null);
      await toggleDoctorActiveStatus(doctorId, newStatus);
      setSuccessMsg(
        `Doctor has been ${newStatus ? 'activated' : 'deactivated'} successfully.`
      );
      fetchDoctorsList();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update doctor status.'
      );
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    const confirmed = window.confirm(
      `⚠️ PERMANENT ACTION\n\nYou are about to permanently delete Dr. ${doctorName} from the system.\n\nThis will:\n• Delete their user account\n• Cancel all active appointments\n• Remove all leave records\n\nThis action CANNOT be undone. Continue?`
    );
    if (!confirmed) return;

    try {
      setIsDeletingDoctor(true);
      setError(null);
      setSuccessMsg(null);
      const result = await deleteDoctor(doctorId);
      setSuccessMsg(result.message);
      // Optimistic removal — no need to refetch
      setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete doctor. Please try again.'
      );
    } finally {
      setIsDeletingDoctor(false);
    }
  };

  const uniqueSpecializations = Array.from(
    new Set(doctors.map((d) => d.specialization).filter(Boolean))
  );

  const activeCount = doctors.filter((d) => d.isActive !== false).length;


  return (
    <div className="container dashboard-container" style={{ maxWidth: '1180px', padding: '2rem 1.5rem', margin: '0 auto' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Doctor Management
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                background: '#eff6ff',
                color: '#0062cc',
                border: '1px solid #bfdbfe',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <ShieldCheck size={12} /> Admin Directory
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Provision practitioner accounts, configure working hours, and manage schedules.
          </p>
        </div>

        <Link
          to="/admin/doctors/create"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0062cc, #0052ad)',
            color: '#ffffff',
            fontSize: '0.88rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0, 98, 204, 0.25)',
          }}
        >
          <PlusCircle size={16} />
          <span>Add New Doctor</span>
        </Link>
      </div>

      {successMsg && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {/* 3 Top Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Doctors
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
              <Users size={18} />
            </div>
          </div>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{doctors.length}</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Configured in System</span>
        </div>

        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Practitioners
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669' }}>{activeCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Accepting bookings</span>
        </div>

        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Specialties
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0062cc' }}>
              <Stethoscope size={18} />
            </div>
          </div>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0062cc' }}>{uniqueSpecializations.length}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Medical domains covered</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ marginBottom: '1.75rem' }}>
        <DoctorSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSpecialization={selectedSpecialization}
          onSpecializationChange={setSelectedSpecialization}
          specializations={uniqueSpecializations}
          onReset={() => {
            setSearchTerm('');
            setSelectedSpecialization('');
          }}
        />
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <div className="skeleton-grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : doctors.length === 0 ? (
        <div
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1.5px dashed #cbd5e1',
          }}
        >
          <Stethoscope size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
            No practitioners found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Try adjusting your search keywords or specialization filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              isAdminView={true}
              onToggleStatus={(docId, newStatus) => handleToggleStatus(docId, newStatus)}
              isStatusUpdating={isStatusUpdating}
              onDeleteDoctor={handleDeleteDoctor}
              isDeletingDoctor={isDeletingDoctor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
