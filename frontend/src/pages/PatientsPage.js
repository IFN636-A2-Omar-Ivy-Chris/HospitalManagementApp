
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './PatientsPage.css';

// Default advanced filter values
const initialFilters = {
  name: '',
  id: '',
  minAge: '',
  maxAge: '',
  ward: '',
  gender: '',
  medication: ''
};

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [wards, setWards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wardError, setWardError] = useState('');

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Basic search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // this is for improving responsiveness

  // Advanced filter form
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState(false);

  const [filters, setFilters] = useState({ ...initialFilters });

  // Filters currently applied to the API query
  const [appliedFilters, setAppliedFilters] =
    useState({ ...initialFilters });

  // Retrieve wards for the filter dropdown
  useEffect(() => {
    const getWards = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get('/api/wards', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setWards(response.data);
      } catch (error) {
        setWardError('Unable to load ward options');
      }
    };

    getWards();
  }, []);

  // Retrieve patients using search and filter criteria
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError('');

    const getPatients = async () => {
      try {
        const token = localStorage.getItem('token');

        // Combine basic search with applied advanced filters
        const criteria = {
          search: debouncedSearchTerm,
          ...appliedFilters,
            sortBy: sortBy,
            sortOrder: sortOrder
        };

        // Remove empty criteria from the request
        const params = {};

        for (const [key, value] of Object.entries(criteria)) {
          if (value !== '') {
            params[key] = value;
          }
        }

        const response = await axios.get('/api/patients', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: params, // key change from previous get patients, params are for query
          signal: controller.signal
        });

        setPatients(response.data);

      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          error.response?.data?.message ||
          'Unable to load patients'
        );

        setPatients([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // Execute the API request immediately
    getPatients();

    return () => {
      controller.abort();
    };

  }, [debouncedSearchTerm, appliedFilters, sortBy, sortOrder]);

  // Delay Quick Search requests while the user is typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);


  // Update an individual advanced filter
  const updateFilter = (field, value) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [field]: value
    }));
  };

  // Apply the advanced filter form
  const applyFilters = (event) => {
    event.preventDefault();

    setAppliedFilters({ ...filters });
  };

  // Reset all search and filter criteria
  const resetAllFilters = () => {
    setSearchTerm('');
    setFilters({ ...initialFilters });
    setAppliedFilters({ ...initialFilters });
  };

  // Format date of birth as DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('en-AU', {
      timeZone: 'UTC'
    });
  };

  // Update the selected sorting column and direction
  const handleSort = (column) => {
    if (sortBy === column) {
      // Clicking the selected column reverses the direction
      setSortOrder((previousOrder) =>
        previousOrder === 'asc' ? 'desc' : 'asc'
      );
    } else {
      // Selecting another column defaults to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Check whether any search criteria are active
  const hasActiveCriteria =
    searchTerm.trim() !== '' ||
    Object.values(appliedFilters).some(
      (value) => value !== ''
    );

  return (
    <>
      <Navbar />

      <main className="page-container">

        {/* Page heading and quick search */}
        <div className="patients-page-header">
          <h1>Patients</h1>

          <div className="patients-search-container">
            <input
              type="search"
              className="patients-search-input"
              placeholder="Search by name or ID..."
              aria-label="Search patients by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button
              type="button"
              className="advanced-filter-button"
              onClick={() =>
                setShowAdvancedFilters(!showAdvancedFilters)
              }
              aria-expanded={showAdvancedFilters}
              aria-controls="advanced-patient-filters"
            >
              Advanced Filter {showAdvancedFilters ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Advanced filter form */}
        {showAdvancedFilters && (
          <form
            id="advanced-patient-filters"
            className="advanced-filter-panel"
            onSubmit={applyFilters}
          >
            <div className="advanced-filter-header">
              <h2>Advanced Filters</h2>

              <button
                type="button"
                className="reset-filter-button"
                onClick={resetAllFilters}
              >
                Reset All
              </button>
            </div>

            <div className="advanced-filter-grid">

              {/* Patient Name */}
              <div className="filter-field">
                <label htmlFor="filter-name">
                  Patient Name
                </label>
                <input
                  id="filter-name"
                  type="text"
                  placeholder="Enter patient name"
                  value={filters.name}
                  onChange={(e) =>
                    updateFilter('name', e.target.value)
                  }
                />
              </div>

              {/* Patient ID */}
              <div className="filter-field">
                <label htmlFor="filter-id">
                  Patient ID
                </label>
                <input
                  id="filter-id"
                  type="text"
                  placeholder="Enter patient ID"
                  value={filters.id}
                  onChange={(e) =>
                    updateFilter('id', e.target.value)
                  }
                />
              </div>

              {/* Minimum Age */}
              <div className="filter-field">
                <label htmlFor="filter-min-age">
                  Minimum Age
                </label>
                <input
                  id="filter-min-age"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 18"
                  value={filters.minAge}
                  onChange={(e) =>
                    updateFilter('minAge', e.target.value)
                  }
                />
              </div>

              {/* Maximum Age */}
              <div className="filter-field">
                <label htmlFor="filter-max-age">
                  Maximum Age
                </label>
                <input
                  id="filter-max-age"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 65"
                  value={filters.maxAge}
                  onChange={(e) =>
                    updateFilter('maxAge', e.target.value)
                  }
                />
              </div>

              {/* Ward */}
              <div className="filter-field">
                <label htmlFor="filter-ward">
                  Ward
                </label>
                <select
                  id="filter-ward"
                  value={filters.ward}
                  onChange={(e) =>
                    updateFilter('ward', e.target.value)
                  }
                >
                  <option value="">All wards</option>

                  {wards.map((ward) => (
                    <option
                      key={ward._id}
                      value={ward._id}
                    >
                      {ward.name}
                    </option>
                  ))}
                </select>

                {wardError && (
                  <p className="error-message" role="alert">
                    {wardError}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="filter-field">
                <label htmlFor="filter-gender">
                  Gender
                </label>
                <select
                  id="filter-gender"
                  value={filters.gender}
                  onChange={(e) =>
                    updateFilter('gender', e.target.value)
                  }
                >
                  <option value="">All genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Medication */}
              <div className="filter-field">
                <label htmlFor="filter-medication">
                  Medication
                </label>
                <input
                  id="filter-medication"
                  type="text"
                  placeholder="Enter medication name"
                  value={filters.medication}
                  onChange={(e) =>
                    updateFilter('medication', e.target.value)
                  }
                />
              </div>
            </div>

            {/* Apply selected filters */}
            <div className="advanced-filter-actions">
              <button
                type="submit"
                className="apply-filter-button"
              >
                Apply Filters
              </button>
            </div>

          </form>
        )}
        {/* Dedicated space for loading and updating messages */}
        <div className="patients-status-container" role="status" aria-live="polite">
        {/* Loading state */}
        {loading && (
          <p role="status">
            {patients.length === 0
              ? 'Loading patients...'
              : 'Updating patients...'}
          </p>
        )}
        </div>
        {/* Error state */}
        {!loading && error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {/* Empty results state */}
        {!loading && !error && patients.length === 0 && (
          <p>
            {hasActiveCriteria
              ? 'No patients match your search criteria.'
              : 'No patients found in the hospital.'}
          </p>
        )}

        {/* Patient table */}
        {!error && patients.length > 0 && (
          <div className="patients-table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  {/* Patient Name */}
                  <th
                    scope="col"
                    aria-sort={
                      sortBy === 'name'
                        ? (sortOrder === 'asc' ? 'ascending' : 'descending')
                        : 'none'
                    }
                  >
                    <button
                      type="button"
                      className={
                        sortBy === 'name'
                          ? 'sort-header active-sort'
                          : 'sort-header'
                      }
                      onClick={() => handleSort('name')}
                    >
                      Patient Name
                      <span className="sort-indicator" aria-hidden="true">
                        {sortBy === 'name'
                          ? (sortOrder === 'asc' ? '▲' : '▼')
                          : '⇅'}
                      </span>
                    </button>
                  </th>

                  {/* Patient ID - not sortable */}
                  <th scope="col">
                    Patient ID
                  </th>

                  {/* Date of Birth */}
                  <th
                    scope="col"
                    aria-sort={
                      sortBy === 'dateOfBirth'
                        ? (sortOrder === 'asc' ? 'ascending' : 'descending')
                        : 'none'
                    }
                  >
                    <button
                      type="button"
                      className={
                        sortBy === 'dateOfBirth'
                          ? 'sort-header active-sort'
                          : 'sort-header'
                      }
                      onClick={() => handleSort('dateOfBirth')}
                    >
                      Date of Birth
                      <span className="sort-indicator" aria-hidden="true">
                        {sortBy === 'dateOfBirth'
                          ? (sortOrder === 'asc' ? '▲' : '▼')
                          : '⇅'}
                      </span>
                    </button>
                  </th>

                  {/* Gender */}
                  <th
                    scope="col"
                    aria-sort={
                      sortBy === 'gender'
                        ? (sortOrder === 'asc' ? 'ascending' : 'descending')
                        : 'none'
                    }
                  >
                    <button
                      type="button"
                      className={
                        sortBy === 'gender'
                          ? 'sort-header active-sort'
                          : 'sort-header'
                      }
                      onClick={() => handleSort('gender')}
                    >
                      Gender
                      <span className="sort-indicator" aria-hidden="true">
                        {sortBy === 'gender'
                          ? (sortOrder === 'asc' ? '▲' : '▼')
                          : '⇅'}
                      </span>
                    </button>
                  </th>

                  {/* Ward */}
                  <th
                    scope="col"
                    aria-sort={
                      sortBy === 'ward'
                        ? (sortOrder === 'asc' ? 'ascending' : 'descending')
                        : 'none'
                    }
                  >
                    <button
                      type="button"
                      className={
                        sortBy === 'ward'
                          ? 'sort-header active-sort'
                          : 'sort-header'
                      }
                      onClick={() => handleSort('ward')}
                    >
                      Ward
                      <span className="sort-indicator" aria-hidden="true">
                        {sortBy === 'ward'
                          ? (sortOrder === 'asc' ? '▲' : '▼')
                          : '⇅'}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>
                      <Link to={`/patients/${patient._id}`}>
                        {patient.name}
                      </Link>
                    </td>

                    <td>{patient._id}</td>

                    <td>
                      {formatDate(patient.dateOfBirth)}
                    </td>

                    <td>{patient.gender || '-'}</td>

                    <td>
                      {patient.ward?.name || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </>
  );
}

export default PatientsPage;
