import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types/doctor';
import { getDoctors } from '../../services/doctorApi';
import { DoctorCard } from '../../components/doctor/DoctorCard';
import { DoctorSearchBar } from '../../components/doctor/DoctorSearchBar';
import {
  AlertCircle,
  PlusCircle,
  Stethoscope,
  Users,
} from 'lucide-react';

export const ManageDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  const fetchDoctorsList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDoctors({
        search: searchTerm,
        specialization: selectedSpecialization,
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

  const uniqueSpecializations = Array.from(
    new Set(doctors.map((d) => d.specialization).filter(Boolean))
  );

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <h1 className="welcome-title" style={{ fontSize: '1.85rem' }}>
            Doctor Management
          </h1>
          <p className="welcome-subtitle">
            Provision practitioner accounts, configure working hours, and manage schedules.
          </p>
        </div>
        <Link to="/admin/doctors/create" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add New Doctor</span>
        </Link>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Doctors</span>
            <Users size={20} color="#a855f7" />
          </div>
          <span className="stat-value">{doctors.length}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Configured in System
          </span>
        </div>

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Specializations</span>
            <Stethoscope size={20} color="var(--primary)" />
          </div>
          <span className="stat-value">{uniqueSpecializations.length}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Active Medical Domains
          </span>
        </div>
      </div>

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

      {error && (
        <div className="alert alert-error" style={{ marginTop: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="loader-container">
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            Loading doctor directory...
          </p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="glass-card empty-state-card">
          <Stethoscope size={48} color="var(--text-muted)" />
          <h3>No Doctors Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.25rem' }}>
            {searchTerm || selectedSpecialization
              ? 'No doctors matched your filter criteria.'
              : 'No doctor profiles have been created yet.'}
          </p>
          <Link to="/admin/doctors/create" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Create First Doctor Profile</span>
          </Link>
        </div>
      ) : (
        <div className="doctors-grid">
          {doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} isAdminView={true} />
          ))}
        </div>
      )}
    </div>
  );
};
