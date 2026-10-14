
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './PatientsPage.css';

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const initialFilters = {
    name: '',
    id: '',
    minAge: '',
    maxAge: '',
    ward: '',
    gender: '',
    medication: ''
  };

const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const getPatients = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          '/api/patients',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setPatients(response.data);
      } catch (error) {
        setError('Unable to load patients');
      } finally {
        setLoading(false);
      }
    };

    getPatients();
  }, []);

  // Format date of birth as DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('en-AU', {
      timeZone: 'UTC'
    });
  };

  // Update an individual filter field
  const updateFilter = (field, value) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [field]: value
    }));
  };

  // Reset all search and filter criteria
  const resetAllFilters = () => {
    setFilters({
      name: '',
      id: '',
      minAge: '',
      maxAge: '',
      ward: '',
      gender: '',
      medication: ''
    });

    setSearchTerm('');
  };

  // Get available ward names from loaded patient records
  const wardOptions = [
    ...new Set(
      patients
        .map((patient) => patient.ward?.name)
        .filter(Boolean)
    )
  ].sort();


  return (
    <>
      <Navbar />

      <main className="page-container">
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
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              aria-expanded={showAdvancedFilters}
              aria-controls="advanced-patient-filters"
            >
              Advanced Filter {showAdvancedFilters ? '▲' : '▼'}
            </button>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <form
            id="advanced-patient-filters"
            className="advanced-filter-panel"
            aria-label="Advanced patient filters"
            onSubmit={(e) => e.preventDefault()}
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
                <label htmlFor="filter-name">Patient Name</label>
                <input
                  id="filter-name"
                  type="text"
                  placeholder="Enter patient name"
                  value={filters.name}
                  onChange={(e) => updateFilter('name', e.target.value)}
                />
              </div>

              {/* Patient ID */}
              <div className="filter-field">
                <label htmlFor="filter-id">Patient ID</label>
                <input
                  id="filter-id"
                  type="text"
                  placeholder="Enter patient ID"
                  value={filters.id}
                  onChange={(e) => updateFilter('id', e.target.value)}
                />
              </div>

              {/* Minimum Age */}
              <div className="filter-field">
                <label htmlFor="filter-min-age">Minimum Age</label>
                <input
                  id="filter-min-age"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 18"
                  value={filters.minAge}
                  onChange={(e) => updateFilter('minAge', e.target.value)}
                />
              </div>

              {/* Maximum Age */}
              <div className="filter-field">
                <label htmlFor="filter-max-age">Maximum Age</label>
                <input
                  id="filter-max-age"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 65"
                  value={filters.maxAge}
                  onChange={(e) => updateFilter('maxAge', e.target.value)}
                />
              </div>

              {/* Ward */}
              <div className="filter-field">
                <label htmlFor="filter-ward">Ward</label>
                <select
                  id="filter-ward"
                  value={filters.ward}
                  onChange={(e) => updateFilter('ward', e.target.value)}
                >
                  <option value="">All wards</option>

                  {wardOptions.map((wardName) => (
                    <option key={wardName} value={wardName}>
                      {wardName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="filter-field">
                <label htmlFor="filter-gender">Gender</label>
                <select
                  id="filter-gender"
                  value={filters.gender}
                  onChange={(e) => updateFilter('gender', e.target.value)}
                >
                  <option value="">All genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Medication */}
              <div className="filter-field">
                <label htmlFor="filter-medication">Medication</label>
                <input
                  id="filter-medication"
                  type="text"
                  placeholder="Enter medication name"
                  value={filters.medication}
                  onChange={(e) => updateFilter('medication', e.target.value)}
                />
              </div>

            </div>
          </form>
        )}


        {loading && (
          <p role="status">Loading patients...</p>
        )}

        {!loading && error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && patients.length === 0 && (
          <p>No patients found in the hospital.</p>
        )}

        {!loading && !error && patients.length > 0 && (
          <div className="patients-table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th scope="col">Patient Name</th>
                  <th scope="col">Patient ID</th>
                  <th scope="col">Date of Birth</th>
                  <th scope="col">Gender</th>
                  <th scope="col">Ward</th>
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
