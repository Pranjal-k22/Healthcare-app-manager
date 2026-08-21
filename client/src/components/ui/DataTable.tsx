import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from 'lucide-react';
import Button from './Button';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  title?: string;
  searchPlaceholder?: string;
  enableExport?: boolean;
  exportFileName?: string;
  filterOptions?: {
    label: string;
    key: keyof T | string;
    options: { label: string; value: string }[];
  };
  emptyState?: React.ReactNode;
  actions?: React.ReactNode;
  pageSize?: number;
  mobileCardRender?: (item: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  title,
  searchPlaceholder = 'Search records...',
  enableExport = true,
  exportFileName = 'export-data',
  filterOptions,
  emptyState,
  actions,
  pageSize = 10,
  mobileCardRender,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering & Search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter by dropdown
    if (filterOptions && activeFilter !== 'ALL') {
      result = result.filter((item) => {
        const val = String(item[filterOptions.key] || '');
        return val.toUpperCase() === activeFilter.toUpperCase();
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        return columns.some((col) => {
          if (col.searchable === false) return false;
          const val = item[col.key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const comp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDirection === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [data, filterOptions, activeFilter, searchQuery, columns, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');
    const rows = filteredData.map((item) =>
      columns
        .map((col) => {
          const val = item[col.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="datatable-container-ui">
      {/* Table Toolbar */}
      <div className="datatable-toolbar">
        <div className="datatable-toolbar-left">
          {title && <h3 className="datatable-title card-title">{title}</h3>}
          <div className="datatable-search-wrapper">
            <Search size={16} className="datatable-search-icon" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="datatable-search-input"
            />
          </div>

          {filterOptions && (
            <div className="datatable-filter-wrapper">
              <Filter size={15} className="datatable-filter-icon" />
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="datatable-filter-select"
              >
                <option value="ALL">All {filterOptions.label}</option>
                {filterOptions.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="datatable-toolbar-right">
          {actions}
          {enableExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download size={14} />}
              disabled={filteredData.length === 0}
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Desktop & Tablet Table View */}
      <div className="datatable-table-scroll-wrapper">
        <table className="datatable-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`datatable-th ${col.sortable !== false ? 'is-sortable' : ''} text-${col.align || 'left'}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="th-content">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="th-sort-icon">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp size={14} color="var(--primary)" />
                          ) : (
                            <ChevronDown size={14} color="var(--primary)" />
                          )
                        ) : (
                          <ChevronsUpDown size={14} color="var(--text-muted)" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={keyExtractor(item)} className="datatable-tr">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`datatable-td table-text text-${col.align || 'left'}`}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="datatable-empty-cell">
                  {emptyState || (
                    <div className="datatable-empty-state">
                      <p className="helper-text">No records found matching criteria.</p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="datatable-mobile-cards-view">
        {paginatedData.length > 0 ? (
          paginatedData.map((item) => (
            <div key={keyExtractor(item)} className="datatable-mobile-card">
              {mobileCardRender ? (
                mobileCardRender(item)
              ) : (
                columns.map((col) => (
                  <div key={col.key} className="mobile-card-row">
                    <span className="mobile-card-label helper-text">{col.header}</span>
                    <span className="mobile-card-value table-text">
                      {col.render ? col.render(item) : item[col.key]}
                    </span>
                  </div>
                ))
              )}
            </div>
          ))
        ) : (
          <div className="datatable-empty-card">
            {emptyState || <p className="helper-text">No records found.</p>}
          </div>
        )}
      </div>

      {/* Table Pagination */}
      <div className="datatable-pagination">
        <span className="pagination-info helper-text">
          Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className="pagination-controls">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            leftIcon={<ChevronLeft size={14} />}
          >
            Prev
          </Button>
          <span className="pagination-page-indicator button-text">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            rightIcon={<ChevronRight size={14} />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
