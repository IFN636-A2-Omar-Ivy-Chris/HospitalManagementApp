# Hospital Management App

Hospital Management App is a MERN web application developed for the IFN636 Software Life Cycle Management assessment. The application provides basic hospital ward and patient management functionality for doctors and nurses.

## Features

* User login and authentication using JWT
* Doctor and nurse role-based access
* View hospital wards
* View patients assigned to each ward
* View patient records
* Admit new patients
* Edit basic patient details
* Transfer patients between wards
* Discharge patients

Some functionality is restricted by role. For example, only doctors can admit and transfer patients.

## Architecture

The application uses the MERN stack:

* **Frontend:** React
* **Backend:** Node.js and Express
* **Database:** MongoDB Atlas
* **Authentication:** JSON Web Tokens (JWT)
* **Deployment:** Amazon EC2

The frontend communicates with the backend through REST API endpoints. The Express backend handles authentication, authorisation, validation and database operations using Mongoose.

```text
React Frontend
      |
      | REST API
      v
Node.js / Express Backend
      |
      | Mongoose
      v
MongoDB Atlas
```

## Local Setup

### Requirements

* Node.js
* npm
* MongoDB Atlas database

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/ChristopherNHorsfall/HospitalManagementApp
cd HospitalManagementApp
npm run install-all
```

Create a `.env` file inside the `backend` directory containing:

```text
PORT=5001
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<JWT secret>
```

Add sample data for the home page (run once):

```bash
cd backend
npm run seed:news
npm run seed:oncall
cd ..
```

This replaces any existing news with three sample items.

Start the application from the project root:

```bash
npm start
```

The frontend will run at:

```text
http://localhost:3000
```

The backend runs on port `5001`. Port `5000` is avoided because macOS uses it for AirPlay Receiver.

## Deployment

The application is deployed to an Amazon EC2 instance.

**Deployment URL:**
`http://<EC2-PUBLIC-IP>:3000`

The EC2 public IP will change when the instance is stopped and restarted. 

## Known Limitations

* The application currently supports only doctor and nurse workflows implemented for the assessment sprint.
* Patient medical information such as medications and history is not yet editable.
* Discharging a patient currently removes the patient record from the database rather than retaining an archived medical record.
* Ward capacity and bed allocation are not currently managed.
* The application uses a basic development deployment configuration suitable for assessment demonstration rather than a production environment.
* The EC2 public IP address may change after the instance is stopped and restarted.

## Version Control

Development is managed using Git and GitHub with feature branches and regular commits associated with jira stories and subtasks. 


Test Account - Pharmacist 
Name: Test Pharmacist 
Email: pharmacist@hospital.com
Password: password
Role: Pharmacist 



