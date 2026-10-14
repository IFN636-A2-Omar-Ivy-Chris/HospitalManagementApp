function RemovePrescriptionConfirmation({ prescription, onCancel, onConfirm }) {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Confirm Remove</h2>

                <p>
                    Are you sure you want to remove{" "}
                    {prescription.medication?.name || "this medication"} from
                    this patient's record?
                </p>

                <p>The medication will stay in the pharmacy catalogue.</p>

                <div className="modal-actions">
                    <button onClick={onCancel}>Cancel</button>

                    <button onClick={onConfirm}>Confirm Remove</button>
                </div>
            </div>
        </div>
    );
}

export default RemovePrescriptionConfirmation;