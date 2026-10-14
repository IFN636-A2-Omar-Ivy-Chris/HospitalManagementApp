import { useState } from "react";

function EditPrescriptionForm({ prescription, onSubmit, onCancel }) {
    const [dosage, setDosage] = useState(prescription.dosage);
    const [frequency, setFrequency] = useState(prescription.frequency);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError("");

        const newErrors = {};

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
                dosage: dosage.trim(),
                frequency: frequency.trim(),
            });
        } catch (error) {
            setSubmitError(
                error.response?.data?.message || "Unable to update medication",
            );
            setSubmitting(false);
        }
    };

    return (
        <form className="patient-form" onSubmit={handleSubmit} noValidate>
            {submitError && <p className="error-message">{submitError}</p>}

            <p>
                <strong>{prescription.medication?.name}</strong> (
                {prescription.medication?.form})
            </p>

            <div className="form-group">
                <label htmlFor={`edit-dosage-${prescription._id}`}>Dosage</label>
                <input
                    type="text"
                    id={`edit-dosage-${prescription._id}`}
                    value={dosage}
                    onChange={(event) => setDosage(event.target.value)}
                />
                {errors.dosage && <p className="form-error">{errors.dosage}</p>}
            </div>

            <div className="form-group">
                <label htmlFor={`edit-frequency-${prescription._id}`}>
                    Frequency
                </label>
                <input
                    type="text"
                    id={`edit-frequency-${prescription._id}`}
                    value={frequency}
                    onChange={(event) => setFrequency(event.target.value)}
                />
                {errors.frequency && (
                    <p className="form-error">{errors.frequency}</p>
                )}
            </div>

            <div className="form-actions">
                <button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Changes"}
                </button>

                <button type="button" onClick={onCancel} disabled={submitting}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default EditPrescriptionForm;