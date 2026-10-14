import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import DischargeConfirmation from "../components/DischargeConfirmation";
import TransferPatientModal from "../components/TransferPatientModal";
import PrescribeMedicationForm from "../components/PrescribeMedicationForm";

function PatientRecordPage() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState("");
    const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [patientToTransfer, setPatientToTransfer] = useState(null);
    const [transferSuccess, setTransferSuccess] = useState("");
    const [transferError, setTransferError] = useState("");
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicationsLoading, setMedicationsLoading] = useState(true);
    const [medicationsError, setMedicationsError] = useState("");
    const [showPrescribeForm, setShowPrescribeForm] = useState(false);
    const [prescriptionSuccess, setPrescriptionSuccess] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const isDoctor = user?.role === "doctor";

    useEffect(() => {
        const getPatient = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `/api/patients/${patientId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                setPatient(response.data);
            } catch (error) {
                setError("Unable to load patient record");
            }
        };

        getPatient();
    }, [patientId]);


    useEffect(() => {
        const getPrescriptions = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `/api/patients/${patientId}/medications`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                setPrescriptions(response.data);
            } catch (error) {
                setMedicationsError("Unable to load medications");
            } finally {
                setMedicationsLoading(false);
            }
        };

        getPrescriptions();
    }, [patientId]);

    if (error) {
        return (
            <>
                <Navbar />
                <main className="page-container">
                    <p className="error-message">{error}</p>
                </main>
            </>
        );
    }

    if (!patient) {
        return (
            <>
                <Navbar />
                <main className="page-container">
                    <p>Loading patient record...</p>
                </main>
            </>
        );
    }

    const handleDischarge = async () => {
        try {
            setSubmitError("");

            const token = localStorage.getItem("token");

            await axios.delete(
                `/api/patients/${patientId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            setShowDischargeConfirm(false);
            setSuccessMessage("Patient discharged successfully");

            setTimeout(() => {
                navigate(`/wards/${patient.ward._id}`);
            }, 1000);
        } catch (error) {
            setShowDischargeConfirm(false);

            if (error.response?.data?.message) {
                setSubmitError(error.response.data.message);
            } else {
                setSubmitError("Unable to discharge patient");
            }
        }
    };
    const handleTransfer = async (destinationWardId) => {
        try {
            setTransferSuccess("");
            setTransferError("");

            const token = localStorage.getItem("token");

            await axios.patch(
                `/api/patients/${patientId}/transfer`,
                {
                    ward: destinationWardId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            setShowTransferModal(false);
            setTransferSuccess("Patient transferred successfully");

            setTimeout(() => {
                navigate(`/wards/${destinationWardId}`);
            }, 1000);
        } catch (error) {
            setShowTransferModal(false);

            if (error.response?.data?.message) {
                setTransferError(error.response.data.message);
            } else {
                setTransferError("Unable to transfer patient");
            }
        }
    };

        const openPrescribeForm = () => {
        setPrescriptionSuccess("");
        setShowPrescribeForm(true);
    };

    const handlePrescribe = async (prescriptionData) => {
        const token = localStorage.getItem("token");

        const response = await axios.post(
            `/api/patients/${patientId}/medications`,
            prescriptionData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        setPrescriptions([...prescriptions, response.data]);
        setShowPrescribeForm(false);
        setPrescriptionSuccess(
            `${response.data.medication?.name || "Medication"} prescribed`,
        );
    };

    return (
        <>
            <Navbar />

            <main className="page-container">
                <div className="patient-record-header">
                    <h1>Patient Record: {patient.name}</h1>

                    <div className="patient-record-actions">
                        <button onClick={() => setShowTransferModal(true)}>
                            Transfer
                        </button>
                        <button onClick={() => setShowDischargeConfirm(true)}>
                            Discharge
                        </button>
                    </div>
                </div>
                {error && <p className="error-message">{error}</p>}
                {successMessage && (
                    <p className="success-message">{successMessage}</p>
                )}
                {transferSuccess && (
                    <p className="success-message">{transferSuccess}</p>
                )}

                {transferError && (
                    <p className="error-message">{transferError}</p>
                )}
                <section className="record-section">
                    <div className="record-section-header">
                        <h2>Basic Details</h2>
                        <button
                            onClick={() =>
                                navigate(`/patients/${patientId}/edit`)
                            }
                        >
                            Edit
                        </button>
                    </div>

                    <p>
                        <strong>Name:</strong> {patient.name}
                    </p>

                    <p>
                        <strong>Date of Birth:</strong>{" "}
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </p>

                    <p>
                        <strong>Gender:</strong> {patient.gender}
                    </p>

                    <p>
                        <strong>Contact Number:</strong> {patient.contactNumber}
                    </p>

                    <p>
                        <strong>Ward:</strong>{" "}
                        {patient.ward?.name || "Not assigned"}
                    </p>
                </section>

                <section className="record-section">
                    <div className="record-section-header">
                        <h2>Current Medications</h2>
                        {isDoctor && !showPrescribeForm && (
                            <button onClick={openPrescribeForm}>Prescribe</button>
                        )}
                    </div>

                    {prescriptionSuccess && (
                        <p className="success-message">{prescriptionSuccess}</p>
                    )}

                    {showPrescribeForm && (
                        <PrescribeMedicationForm
                            onSubmit={handlePrescribe}
                            onCancel={() => setShowPrescribeForm(false)}
                        />
                    )}

                    {medicationsLoading && <p>Loading medications...</p>}

                    {medicationsError && (
                        <p className="error-message">{medicationsError}</p>
                    )}

                    {!medicationsLoading &&
                        !medicationsError &&
                        prescriptions.length === 0 && (
                            <p>No medications recorded.</p>
                        )}

                    {!medicationsLoading &&
                        !medicationsError &&
                        prescriptions.length > 0 && (
                            <ul className="medication-list">
                                {prescriptions.map((prescription) => (
                                    <li key={prescription._id}>
                                        <strong>
                                            {prescription.medication?.name ||
                                                "Unknown medication"}
                                        </strong>{" "}
                                        ({prescription.medication?.form}) -{" "}
                                        {prescription.dosage},{" "}
                                        {prescription.frequency}
                                    </li>
                                ))}
                            </ul>
                        )}
                </section>

                <section className="record-section">
                    <div className="record-section-header">
                        <h2>Diagnosis</h2>
                        <button>Edit</button>
                    </div>

                    <p>No diagnosis recorded.</p>
                </section>

                <section className="record-section">
                    <div className="record-section-header">
                        <h2>History</h2>
                        <button>Edit</button>
                    </div>

                    <p>No history recorded.</p>
                </section>

                {showDischargeConfirm && (
                    <DischargeConfirmation
                        patient={patient}
                        onCancel={() => setShowDischargeConfirm(false)}
                        onConfirm={handleDischarge}
                    />
                )}
                {showTransferModal && (
                    <TransferPatientModal
                        patient={patient}
                        currentWardId={patient.ward._id}
                        onCancel={() => setShowTransferModal(false)}
                        onConfirm={handleTransfer}
                    />
                )}
            </main>
        </>
    );
}

export default PatientRecordPage;
