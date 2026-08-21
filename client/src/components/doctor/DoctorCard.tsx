import React from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types/doctor';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import {
  Award,
  Building2,
  Calendar,
  Clock,
  Edit,
  Eye,
  Mail,
  Power,
  CalendarDays,
  Trash2,
} from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  isAdminView?: boolean;
  onToggleStatus?: (id: string, newStatus: boolean) => void;
  isStatusUpdating?: boolean;
  onDeleteDoctor?: (id: string, name: string) => void;
  isDeletingDoctor?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  isAdminView = false,
  onToggleStatus,
  isStatusUpdating = false,
  onDeleteDoctor,
  isDeletingDoctor = false,
}) => {
  // Format days cleanly: e.g. "Mon, Tue, Wed, Thu"
  const activeDaysList = Object.entries(doctor.workingHours || {})
    .filter(([_, config]) => config && config.enabled)
    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3));

  const formattedDays = activeDaysList.length > 0 ? activeDaysList.join(', ') : 'Schedule on request';

  // Calculate initials (e.g. "Dr. Sarah Jenkins" -> "SJ")
  const cleanName = doctor.name.replace(/^Dr\.\s*/i, '').trim();
  const nameParts = cleanName.split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase() || 'DR';

  return (
    <Card className="doctor-card-ui" style={{ marginBottom: '1.25rem' }}>
      <div className="doctor-card-inner">
        {/* Main Info Section (Left/Center) */}
        <div className="doctor-card-main-info">
          {/* Circular Initials Avatar */}
          <div className="doctor-initials-avatar">
            <span>{initials}</span>
          </div>

          <div className="doctor-details-block">
            {/* Name and Specialization Tag */}
            <div className="doctor-name-row">
              <h3 className="card-title doctor-name-title">{doctor.name}</h3>
              <span className="doctor-spec-chip">{doctor.specialization}</span>
              {doctor.qualifications && doctor.qualifications.length > 0 && (
                <span className="helper-text doctor-qualifications-text">
                  ({doctor.qualifications.join(', ')})
                </span>
              )}
            </div>

            {/* Contact & Location */}
            <div className="doctor-contact-row">
              <span className="doctor-contact-item">
                <Mail size={15} color="var(--text-secondary)" />
                <span>{doctor.email}</span>
              </span>
              <span className="doctor-contact-item">
                <Building2 size={15} color="var(--text-secondary)" />
                <span>{doctor.clinicName || 'HealthPulse Main Hospital Campus'}</span>
              </span>
            </div>

            {/* Stat Row Chips */}
            <div className="doctor-stats-row">
              <span className="doctor-stat-chip">
                <Award size={14} color="var(--primary)" />
                <span>{doctor.experienceYears || 5} yrs exp.</span>
              </span>
              <span className="doctor-stat-divider">•</span>
              <span className="doctor-stat-chip">
                <Clock size={14} color="var(--primary)" />
                <span>{doctor.slotDuration || 30} min consultations</span>
              </span>
              <span className="doctor-stat-divider">•</span>
              <span className="doctor-stat-chip">
                <Calendar size={14} color="var(--primary)" />
                <span>{formattedDays}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Status & Pricing Column */}
        <div className="doctor-card-side-info">
          <div className="doctor-status-and-fee">
            <div className="doctor-status-badge-wrap">
              {doctor.isAvailable && doctor.isActive !== false ? (
                <StatusBadge status="ACTIVE" label="Available" size="sm" />
              ) : (
                <StatusBadge status="EXPIRED" label="Unavailable" size="sm" />
              )}
            </div>
            <div className="doctor-fee-display">
              <span className="doctor-fee-amount">${doctor.consultationFee || 75}</span>
              <span className="doctor-fee-unit">/ visit</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="doctor-card-action-btn-wrap">
            {isAdminView ? (
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
                <Link to={`/admin/doctors/${doctor.id}/edit`} style={{ flex: 1 }}>
                  <Button variant="outline" size="sm" fullWidth leftIcon={<Edit size={14} />}>
                    Edit
                  </Button>
                </Link>
                <Link to={`/admin/doctors/${doctor.id}/leave`} style={{ flex: 1 }}>
                  <Button variant="outline" size="sm" fullWidth leftIcon={<CalendarDays size={14} />}>
                    Leaves
                  </Button>
                </Link>
                {onToggleStatus && (
                  <Button
                    variant={doctor.isActive ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => onToggleStatus(doctor.id, !doctor.isActive)}
                    disabled={isStatusUpdating}
                    title={doctor.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={14} />
                  </Button>
                )}
                {onDeleteDoctor && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteDoctor(doctor.id, doctor.name)}
                    disabled={isDeletingDoctor}
                    title="Permanently delete this doctor"
                    style={{ background: '#dc2626', borderColor: '#dc2626' }}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ) : (
              <Link to={`/patient/doctors/${doctor.id}`}>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={<Eye size={16} />}
                >
                  View Profile & Schedule
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DoctorCard;
