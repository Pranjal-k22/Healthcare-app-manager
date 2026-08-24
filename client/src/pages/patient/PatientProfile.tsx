import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import InlineAlert from '../../components/ui/InlineAlert';
import { useToast } from '../../components/ui/Toast';
import { CalendarSettingsCard } from '../../components/calendar/CalendarSettingsCard';
import Avatar from '../../components/ui/Avatar';
import { AppearanceControl } from '../../components/common/ThemeToggle';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Heart,
  Save,
  Key,
  Printer,
  X,
  Camera,
} from 'lucide-react';

export const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  // Personal Info Form State
  const [formData, setFormData] = useState({
    name: user?.name || 'Jane Doe',
    email: user?.email || 'patient@healthpulse.com',
    phone: '+1 (555) 234-5678',
    dob: '1992-05-18',
    gender: 'Female',
    address: '482 Maplewood Drive, Suite 2B, Springfield, IL',
    emergencyContactName: 'Robert Doe',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+1 (555) 987-6543',
  });

  const [initialData, setInitialData] = useState(formData);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [showPrintSummary, setShowPrintSummary] = useState(false);

  // Change Password Form State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setInitialData(formData);
      setIsSaving(false);
      success('Patient profile information successfully updated.', 'Profile Saved');
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwords.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsPasswordUpdating(true);
    setTimeout(() => {
      setIsPasswordUpdating(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      success('Account password changed successfully.', 'Security Updated');
    }, 700);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="profile-page-view">
        {/* Page Header */}
        <div className="dashboard-header-row" style={{ marginBottom: '1.75rem' }}>
          <div>
            <h1 className="page-title">Patient Profile</h1>
            <p className="body-text" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Manage your personal demographics, medical contact coordinates, and security settings.
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowPrintSummary(true)}
            leftIcon={<Printer size={16} />}
          >
            Print Patient Summary
          </Button>
        </div>

        {/* 2-Column Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Identity & Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Card style={{ textAlign: 'center', padding: '32px 20px' }}>
              {/* Circular Avatar */}
              <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 1rem auto' }}>
                <Avatar
                  name={formData.name}
                  seed={user?._id || user?.email}
                  size="xl"
                />
                <button
                  type="button"
                  title="Update profile photo"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--white)',
                    border: '2px solid var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Camera size={14} />
                </button>
              </div>

              <h2 className="card-title" style={{ fontSize: '18px', marginBottom: '4px' }}>
                {formData.name}
              </h2>
              <div style={{ marginBottom: '1rem' }}>
                <span className="role-badge role-badge-patient" style={{ display: 'inline-block' }}>
                  PATIENT
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--surface-alt)', paddingTop: '1rem', textAlign: 'left', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Member Since:</span>
                  <span style={{ fontWeight: 600 }}>January 2026</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Patient Record:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PAT-00928</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Portal Access:</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>Verified Active</span>
                </div>
              </div>
            </Card>

            <Card style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                <Shield size={18} />
                <h3 className="card-title" style={{ fontSize: '15px', margin: 0 }}>Privacy & HIPAA Protection</h3>
              </div>
              <p className="helper-text" style={{ fontSize: '12px', lineHeight: 1.5, margin: 0 }}>
                Your health records and clinical history are encrypted at rest with 256-bit AES encryption compliant with healthcare privacy regulations.
              </p>
            </Card>

            {/* Appearance Settings */}
            <Card style={{ padding: '20px' }}>
              <AppearanceControl />
            </Card>
          </div>

          {/* Right Column: Editable Profile Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Section 1: Demographics & Personal Info */}
            <Card style={{ padding: '24px' }}>
              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-alt)' }}>
                  <User size={18} color="var(--primary)" />
                  <h3 className="card-title" style={{ margin: 0 }}>Personal & Demographics</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <Input
                    label="Full Legal Name"
                    id="profile-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                  <Select
                    label="Gender Identity"
                    id="profile-gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    options={[
                      { value: 'Female', label: 'Female' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Non-Binary', label: 'Non-Binary' },
                      { value: 'Prefer not to say', label: 'Prefer not to say' },
                    ]}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Input
                    label="Date of Birth"
                    id="profile-dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number"
                    id="profile-phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    leftIcon={<Phone size={15} />}
                    required
                  />
                </div>

                {/* Section 2: Contact & Address */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-alt)' }}>
                  <MapPin size={18} color="var(--primary)" />
                  <h3 className="card-title" style={{ margin: 0 }}>Contact & Residential Address</h3>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <Input
                    label="Email Address (Login ID)"
                    id="profile-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    leftIcon={<Mail size={15} />}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <Input
                    label="Residential Address"
                    id="profile-address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    leftIcon={<MapPin size={15} />}
                    required
                  />
                </div>

                {/* Section 3: Emergency Contact */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-alt)' }}>
                  <Heart size={18} color="var(--danger)" />
                  <h3 className="card-title" style={{ margin: 0 }}>Emergency Contact</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Input
                    label="Contact Name"
                    id="profile-emergency-name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    required
                  />
                  <Input
                    label="Relationship"
                    id="profile-emergency-rel"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                    required
                  />
                  <Input
                    label="Emergency Phone"
                    id="profile-emergency-phone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!isFormDirty || isSaving}
                    isLoading={isSaving}
                    leftIcon={<Save size={16} />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>

            {/* Section 4: Security & Change Password */}
            <Card style={{ padding: '24px' }}>
              <form onSubmit={handleChangePassword}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-alt)' }}>
                  <Key size={18} color="var(--primary)" />
                  <h3 className="card-title" style={{ margin: 0 }}>Change Account Password</h3>
                </div>

                {passwordError && (
                  <InlineAlert
                    type="danger"
                    message={passwordError}
                    onClose={() => setPasswordError(null)}
                    className="mb-4"
                  />
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <Input
                    label="Current Password"
                    id="current-pwd"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                  <Input
                    label="New Password"
                    id="new-pwd"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Min 6 characters"
                    required
                  />
                  <Input
                    label="Confirm Password"
                    id="confirm-pwd"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="md"
                    isLoading={isPasswordUpdating}
                    disabled={!passwords.currentPassword || !passwords.newPassword || isPasswordUpdating}
                    leftIcon={<Key size={15} />}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>

            {/* Section 3: Google Calendar Synchronization */}
            <CalendarSettingsCard />
          </div>
        </div>
      </div>

      {/* Patient Summary Print Preview Modal */}
      {showPrintSummary && (
        <div className="print-modal-backdrop" onClick={() => setShowPrintSummary(false)}>
          <div className="print-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header print-hidden">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Print Preview - Patient Demographic Summary</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="primary" size="sm" onClick={triggerBrowserPrint} leftIcon={<Printer size={14} />}>
                  Print Summary
                </Button>
                <button
                  onClick={() => setShowPrintSummary(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Body (.print-area) */}
            <div className="print-modal-body print-area">
              <div className="printable-document">
                <div className="doc-header">
                  <div>
                    <div className="doc-brand-title">HealthPulse Hospital & Medical Center</div>
                    <div className="doc-brand-subtitle">Patient Medical Record & Demographic Summary</div>
                  </div>
                  <div className="doc-type-badge">
                    <div className="doc-type-title">PATIENT SUMMARY</div>
                    <div className="doc-meta-text">ID: <strong>PAT-00928</strong></div>
                    <div className="doc-meta-text">Generated: {new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="doc-info-grid">
                  <div className="doc-info-block">
                    <h4>Personal Information</h4>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Full Name:</span>
                      <span className="doc-info-val">{formData.name}</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Date of Birth:</span>
                      <span className="doc-info-val">{formData.dob}</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Gender:</span>
                      <span className="doc-info-val">{formData.gender}</span>
                    </div>
                  </div>

                  <div className="doc-info-block">
                    <h4>Contact Coordinates</h4>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Email:</span>
                      <span className="doc-info-val">{formData.email}</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Phone:</span>
                      <span className="doc-info-val">{formData.phone}</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Address:</span>
                      <span className="doc-info-val">{formData.address}</span>
                    </div>
                  </div>
                </div>

                <div className="doc-info-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="doc-info-block">
                    <h4>Designated Emergency Contact</h4>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Contact Name:</span>
                      <span className="doc-info-val">{formData.emergencyContactName} ({formData.emergencyContactRelation})</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Phone:</span>
                      <span className="doc-info-val">{formData.emergencyContactPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="doc-footer">
                  <div>
                    <div>Official confidential patient document. Generated via HealthPulse Healthcare Manager.</div>
                  </div>
                  <div className="doc-signature-line">
                    <div>Patient / Guardian Signature</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientProfile;
