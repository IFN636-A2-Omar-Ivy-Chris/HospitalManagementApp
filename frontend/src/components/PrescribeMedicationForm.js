import { useEffect, useState } from "react";
import axios from "axios";

function PrescribeMedicationForm({ onSubmit, onCancel }) {
    const [catalogue, setCatalogue] = useState([]);
    const [catalogueError, setCatalogueError] = useState("");
    const [medication, setMedication] = useState("");
    const [dosage, setDosage] = useState("");
    const [frequency, setFrequency] = useState("");
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const getCatalogue = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get("/api/medications", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCatalogue(response.data);
            } catch (error) {
                setCatalogueError("Unable to load the pharmacy catalogue");
            }
        };

        getCatalogue();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError("");

        const newErrors = {};

        if (!medication) {
            newErrors.medication = "Select a medication";
        }

        if (!dosage.trim()) {
            newErrors.dosage = "Dosage is required";
        }

        if (!frequency.trim()) {
            newErrors.frequency = "Frequency is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setSubmitting(true);

        try {
            await onSubmit({
                medication,
                dosage: dosage.trim(),
                frequency: frequency.trim(),
            });
        } catch (error) {
            setSubmitError(
                error.response?.data?.message || "Unable to prescribe medication",
            );
            setSubmitting(false);
        }
    };

    return (
        <form className="patient-form" onSubmit={handleSubmit} noValidate>
            {catalogueError && <p className="error-message">{catalogueError}</p>}

            {submitError && <p className="error-message">{submitError}</p>}

            <div className="form-group">
                <label htmlFor="prescribe-medication">Medication</label>
                <select
                    id="prescribe-medication"
                    value={medication}
                    onChange={(event) => setMedication(event.target.value)}
                >
                    <option value="">Select a medication</option>
                    {catalogue.map((item) => (
                        <option key={item._id} value={item._id}>
                            {item.name} ({item.dosage} {item.form})
                        </option>
                    ))}
                </select>
                {errors.medication && (
                    <p className="form-error">{errors.medication}</p>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="prescribe-dosage">Dosage</label>
                <input
                    type="text"
                    id="prescribe-dosage"
                    placeholder="e.g. 1 tablet"
                    value={dosage}
                    onChange={(event) => setDosage(event.target.value)}
                />
                {errors.dosage && <p className="form-error">{errors.dosage}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="prescribe-frequency">Frequency</label>
                <input
                    type="text"
                    id="prescribe-frequency"
                    placeholder="e.g. Every 6 hours"
                    value={frequency}
                    onChange={(event) => setFrequency(event.target.value)}
                />
                {errors.frequency && (
                    <p className="form-error">{errors.frequency}</p>
                )}
            </div>

            <div className="form-actions">
                <button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Prescribe"}
                </button>

                <button type="button" onClick={onCancel} disabled={submitting}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default PrescribeMedicationForm;