import React from 'react';
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
  const hasActiveFilters = searchTerm || selectedSpecialization;

  return (
    <div className="glass-card search-bar-container">
      <div className="search-inputs-row">
        {/* Keyword Search */}
        <div className="search-field" style={{ flex: 2 }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search doctor name or keyword..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Specialization Filter */}
        <div className="search-field" style={{ flex: 1.2 }}>
          <Filter size={18} className="search-icon" />
          <select
            className="form-input search-select"
            value={selectedSpecialization}
            onChange={(e) => onSpecializationChange(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onReset}
            style={{ height: '42px' }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
