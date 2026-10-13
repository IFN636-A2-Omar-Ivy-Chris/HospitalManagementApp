import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import MedicationForm from "../components/MedicationForm";

function PharmacyPage() {
  const [medications, setMedications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const isPharmacist = user?.role === "pharmacist";

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

  const handleAdd = async (medicationData) => {
    const token = localStorage.getItem("token");

    const response = await axios.post("/api/medications", medicationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const updatedList = [...medications, response.data].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    setMedications(updatedList);
    setShowAddForm(false);
    setSuccessMessage(`${response.data.name} added to the catalogue`);
  };

  const openAddForm = () => {
    setSuccessMessage("");
    setShowAddForm(true);
  };

  return (
    <>
      <Navbar />

      <main className="page-container">
        <div className="page-header">
          <h1>Pharmacy</h1>

          {isPharmacist && !showAddForm && (
            <button onClick={openAddForm}>Add Medication</button>
          )}
        </div>

        {successMessage && <p className="success-message">{successMessage}</p>}

        {showAddForm && (
          <MedicationForm
            submitLabel="Add Medication"
            onSubmit={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}

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