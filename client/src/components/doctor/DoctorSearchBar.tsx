import React from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Filter, Search, X } from 'lucide-react';

interface DoctorSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSpecialization: string;
  onSpecializationChange: (value: string) => void;
  specializations: string[];
  onReset: () => void;
}

export const DoctorSearchBar: React.FC<DoctorSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedSpecialization,
  onSpecializationChange,
  specializations,
  onReset,
}) => {
  const hasActiveFilters = Boolean(searchTerm || selectedSpecialization);

  return (
    <Card noPadding className="doctor-search-bar-card" style={{ marginBottom: '1.75rem' }}>
      <div style={{ padding: '18px 20px' }}>
        <div className="search-filter-row">
          {/* Keyword Search Input */}
          <div className="search-input-col">
            <Input
              id="doctor-search-input"
              type="text"
              placeholder="Search doctor name or specialization..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search size={18} />}
              rightIcon={
                searchTerm ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    aria-label="Clear search text"
                  >
                    <X size={16} />
                  </button>
                ) : undefined
              }
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Specialization Select */}
          <div className="filter-select-col">
            <Select
              id="doctor-spec-filter"
              value={selectedSpecialization}
              onChange={(e) => onSpecializationChange(e.target.value)}
              leftIcon={<Filter size={18} />}
              options={[
                { value: '', label: 'All Specializations' },
                ...specializations.map((spec) => ({ value: spec, label: spec })),
              ]}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="clear-btn-col">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onReset}
                leftIcon={<X size={15} />}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DoctorSearchBar;
