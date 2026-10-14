
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
          </div>
        </div>

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
