import React, { useState, useEffect } from 'react';
import { Doctor } from '../../types/doctor';
import { getDoctors } from '../../services/doctorApi';
import { DoctorCard } from '../../components/doctor/DoctorCard';
import { DoctorSearchBar } from '../../components/doctor/DoctorSearchBar';
import { AlertCircle, Stethoscope, Users } from 'lucide-react';

export const DoctorSearch: React.FC = () => {
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
      setError(err.message || 'Failed to load doctors directory.');
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
      <div className="dashboard-header">
        <h1 className="welcome-title">Find a Doctor</h1>
        <p className="welcome-subtitle">
          Browse verified practitioners, explore specializations, and view consultation working hours.
        </p>
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
            Searching practitioner directory...
          </p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="glass-card empty-state-card">
          <Stethoscope size={48} color="var(--text-muted)" />
          <h3>No Doctors Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1rem' }}>
            No doctors matched your current search filters. Try broadening your keywords.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('');
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="doctors-grid" style={{ marginTop: '1.5rem' }}>
          {doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} isAdminView={false} />
          ))}
        </div>
      )}
    </div>
  );
};
