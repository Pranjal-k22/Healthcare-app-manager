import React from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types/doctor';
import {
  Award,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  Eye,
  Mail,
  Power,
  Stethoscope,
} from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  isAdminView?: boolean;
  onToggleStatus?: (id: string, newStatus: boolean) => void;
  isStatusUpdating?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  isAdminView = false,
  onToggleStatus,
  isStatusUpdating = false,
}) => {
  const activeDays = Object.entries(doctor.workingHours || {})
    .filter(([_, config]) => config && config.enabled)
    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3));

  return (
    <div className={`glass-card doctor-card ${!doctor.isActive ? 'doctor-card-inactive' : ''}`}>
      <div className="doctor-card-header">
        <div className="doctor-avatar">
          <Stethoscope size={24} color="#10b981" />
        </div>
        <div className="doctor-main-info" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className="doctor-name">{doctor.name}</h3>
            {doctor.isAvailable ? (
              <span className="status-pill status-pill-active" title="Available for appointments">
                Available
              </span>
            ) : (
              <span className="status-pill status-pill-unavailable" title="Currently unavailable">
                Unavailable
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span className="specialization-badge">{doctor.specialization}</span>
            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <span className="qualification-badge">
                {doctor.qualifications.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="doctor-card-details">
        <div className="detail-item">
          <Mail size={14} className="detail-icon" />
          <span className="detail-text">{doctor.email}</span>
        </div>

        {doctor.clinicName && (
          <div className="detail-item">
            <Building size={14} className="detail-icon" />
            <span className="detail-text">{doctor.clinicName}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={14} color="var(--accent-teal)" />
            <span>{doctor.experienceYears || 0} yrs exp.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#10b981' }}>
            <DollarSign size={14} />
            <span>${doctor.consultationFee || 0} / visit</span>
          </div>
        </div>

        <div className="detail-item">
          <Clock size={14} className="detail-icon" />
          <span className="detail-text">
            {doctor.slotDuration || 30} min consultations
          </span>
        </div>

        <div className="detail-item" style={{ alignItems: 'flex-start' }}>
          <Calendar size={14} className="detail-icon" style={{ marginTop: '3px' }} />
          <div className="days-chip-list">
            {activeDays.length > 0 ? (
              activeDays.map((d) => (
                <span key={d} className="day-chip">
                  {d}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                No active working days
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="doctor-card-actions">
        {isAdminView ? (
          <>
            <Link
              to={`/admin/doctors/${doctor.id}/edit`}
              className="btn btn-outline btn-sm"
              style={{ flex: 1 }}
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </Link>
            <Link
              to={`/admin/doctors/${doctor.id}/leave`}
              className="btn btn-outline btn-sm"
              style={{ flex: 1 }}
            >
              <Calendar size={14} />
              <span>Leaves</span>
            </Link>
            {onToggleStatus && (
              <button
                type="button"
                className={`btn btn-sm ${
                  doctor.isActive ? 'btn-danger-outline' : 'btn-emerald-outline'
                }`}
                onClick={() => onToggleStatus(doctor.id, !doctor.isActive)}
                disabled={isStatusUpdating}
                title={doctor.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
              >
                <Power size={14} />
              </button>
            )}
          </>
        ) : (
          <Link
            to={`/patient/doctors/${doctor.id}`}
            className="btn btn-primary btn-sm btn-block"
          >
            <Eye size={14} />
            <span>View Profile & Schedule</span>
          </Link>
        )}
      </div>
    </div>
  );
};
