function DeleteMedicationConfirmation({ medication, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Confirm Delete</h2>

        <p>Are you sure you want to delete {medication.name}?</p>

        <p>This will remove the medication from the pharmacy catalogue.</p>

        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>

          <button onClick={onConfirm}>Confirm Delete</button>
        </div>
      </div>
    </div>
  );
}

export default DeleteMedicationConfirmation;