import { useState } from "react";

function MedicationForm({ initialValues, submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValues?.name || "");
  const [dosage, setDosage] = useState(initialValues?.dosage || "");
  const [form, setForm] = useState(initialValues?.form || "");
  const [stockQuantity, setStockQuantity] = useState(
    initialValues?.stockQuantity ?? "",
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!dosage.trim()) {
      newErrors.dosage = "Dosage is required";
    }

    if (!form.trim()) {
      newErrors.form = "Form is required";
    }

    if (stockQuantity === "") {
      newErrors.stockQuantity = "Stock quantity is required";
    } else if (
      !Number.isInteger(Number(stockQuantity)) ||
      Number(stockQuantity) < 0
    ) {
      newErrors.stockQuantity =
        "Stock quantity must be a whole number of zero or more";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        dosage: dosage.trim(),
        form: form.trim(),
        stockQuantity: Number(stockQuantity),
      });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Unable to save medication",
      );
      setSubmitting(false);
    }
  };

  return (
    <form className="patient-form" onSubmit={handleSubmit} noValidate>
      {submitError && <p className="error-message">{submitError}</p>}

      <div className="form-group">
        <label htmlFor="medication-name">Name</label>
        <input
          type="text"
          id="medication-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {errors.name && <p className="form-error">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="medication-dosage">Dosage</label>
        <input
          type="text"
          id="medication-dosage"
          placeholder="e.g. 500 mg"
          value={dosage}
          onChange={(event) => setDosage(event.target.value)}
        />
        {errors.dosage && <p className="form-error">{errors.dosage}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="medication-form">Form</label>
        <input
          type="text"
          id="medication-form"
          placeholder="e.g. Tablet"
          value={form}
          onChange={(event) => setForm(event.target.value)}
        />
        {errors.form && <p className="form-error">{errors.form}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="medication-stock">Stock Quantity</label>
        <input
          type="number"
          id="medication-stock"
          min="0"
          step="1"
          value={stockQuantity}
          onChange={(event) => setStockQuantity(event.target.value)}
        />
        {errors.stockQuantity && (
          <p className="form-error">{errors.stockQuantity}</p>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>

        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default MedicationForm;