import React, { useState, useEffect } from 'react';
import { Doctor } from '../../types/doctor';
import { getDoctors } from '../../services/doctorApi';
import { DoctorCard } from '../../components/doctor/DoctorCard';
import { DoctorSearchBar } from '../../components/doctor/DoctorSearchBar';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InlineAlert from '../../components/ui/InlineAlert';
import { Stethoscope, RotateCcw } from 'lucide-react';

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

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('');
  };

  return (
    <DashboardLayout>
      <div className="doctor-search-view">
        {/* Page Header */}
        <div className="dashboard-header-row" style={{ marginBottom: '1.75rem' }}>
          <div>
            <h1 className="page-title">Find a Doctor</h1>
            <p className="body-text" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Browse verified practitioners, explore medical specializations, and book consultation slots.
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <DoctorSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSpecialization={selectedSpecialization}
          onSpecializationChange={setSelectedSpecialization}
          specializations={uniqueSpecializations}
          onReset={handleClearFilters}
        />

        {/* Error Alert */}
        {error && (
          <InlineAlert
            type="danger"
            message={error}
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}

        {/* Doctor List / Loading Skeletons / Empty State */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[1, 2, 3].map((i) => (
              <Card key={i} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--surface-alt)',
                      animation: 'pulse 1.5s infinite ease-in-out',
                    }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ width: '220px', height: '18px', backgroundColor: 'var(--surface-alt)', borderRadius: '4px' }} />
                    <div style={{ width: '140px', height: '14px', backgroundColor: 'var(--surface-alt)', borderRadius: '4px' }} />
                    <div style={{ width: '300px', height: '12px', backgroundColor: 'var(--surface-alt)', borderRadius: '4px' }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <Card className="empty-state-card-ui">
            <div className="empty-state-icon-circle">
              <Stethoscope size={28} />
            </div>
            <h3 className="empty-state-title">No Doctors Found</h3>
            <p className="empty-state-desc">
              {searchTerm || selectedSpecialization
                ? 'No specialists matched your current search criteria. Try adjusting your keyword or choosing a different specialization.'
                : 'No doctor profiles are currently available in the directory.'}
            </p>
            {(searchTerm || selectedSpecialization) && (
              <Button
                variant="outline"
                size="md"
                onClick={handleClearFilters}
                leftIcon={<RotateCcw size={15} />}
              >
                Clear All Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="doctors-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} isAdminView={false} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorSearch;
