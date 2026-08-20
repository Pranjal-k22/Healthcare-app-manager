import React from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types/doctor';
import {
  Calendar,
  CalendarOff,
  Clock,
  Edit3,
  Eye,
  Mail,
  Stethoscope,
} from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  isAdminView?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  isAdminView = false,
}) => {
  // Compute active working days
  const activeDays = Object.entries(doctor.workingHours || {})
    .filter(([_, config]) => config?.enabled)
    .map(([day]) => day.slice(0, 3).toUpperCase());

  return (
    <div className="glass-card doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-avatar">
          <Stethoscope size={24} color="#10b981" />
        </div>
        <div className="doctor-main-info">
          <h3 className="doctor-name">{doctor.name}</h3>
          <span className="specialization-badge">{doctor.specialization}</span>
        </div>
      </div>

      <div className="doctor-card-details">
        <div className="detail-item">
          <Mail size={14} className="detail-icon" />
          <span className="detail-text">{doctor.email}</span>
        </div>

        <div className="detail-item">
          <Clock size={14} className="detail-icon" />
          <span className="detail-text">
            <strong>{doctor.slotDuration} min</strong> consultation slots
          </span>
        </div>

        <div className="detail-item">
          <Calendar size={14} className="detail-icon" />
          <span className="detail-text">
            {activeDays.length > 0 ? (
              <span className="days-chip-list">
                {activeDays.map((d) => (
                  <span key={d} className="day-chip">
                    {d}
                  </span>
                ))}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No active schedule</span>
            )}
          </span>
        </div>

        {doctor.leaves && doctor.leaves.length > 0 && (
          <div className="detail-item">
            <CalendarOff size={14} className="detail-icon" color="#f59e0b" />
            <span className="detail-text" style={{ color: '#f59e0b', fontSize: '0.8rem' }}>
              {doctor.leaves.length} upcoming leave date{doctor.leaves.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
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
              style={{ flex: 1, color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <CalendarOff size={14} />
              <span>Leaves</span>
            </Link>
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
