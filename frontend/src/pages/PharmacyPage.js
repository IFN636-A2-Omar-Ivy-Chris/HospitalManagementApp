import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function PharmacyPage() {
  const [medications, setMedications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMedications = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("/api/medications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMedications(response.data);
      } catch (error) {
        setError("Unable to load medications");
      } finally {
        setLoading(false);
      }
    };

    getMedications();
  }, []);
  return (
    <>
      <Navbar />

      <main className="page-container">
        <h1>Pharmacy</h1>
        {loading && <p>Loading medications...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && medications.length === 0 && (
          <p>No medications in the pharmacy catalogue.</p>
        )}

        {!loading && !error && medications.length > 0 && (
          <table className="medication-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dosage</th>
                <th>Form</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((medication) => (
                <tr key={medication._id}>
                  <td>{medication.name}</td>
                  <td>{medication.dosage}</td>
                  <td>{medication.form}</td>
                  <td>{medication.stockQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}

export default PharmacyPage;
