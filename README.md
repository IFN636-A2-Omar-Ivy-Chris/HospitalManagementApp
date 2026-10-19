# Hospital Management App

Hospital Management App is a MERN web application developed for IFN636 Software Life Cycle Management (Assessment 2). It supports hospital ward, patient and medication management for doctors, nurses and pharmacists, with role-based access to each function.

## Features

**Ward and patient management**
* View wards and the patients assigned to each ward
* View and edit patient records
* Admit, transfer and discharge patients (doctor only)

**Home page**
* Hospital news and on-call staff
* Personal notes: create, edit and delete your own notes

**Pharmacy and prescribing**
* View the medication catalogue (all staff)
* Add, edit and delete medications (pharmacist only)
* View a patient's current medications (all staff)
* Prescribe, modify and remove a patient's medications (doctor only)
* A medication cannot be deleted while it is prescribed to a patient

**Security**
* JWT authentication on every route except login
* Role-based access for doctors, nurses and pharmacists (403 for unauthorised roles)

## Architecture

* **Frontend:** React
* **Backend:** Node.js and Express
* **Database:** MongoDB Atlas (Mongoose)
* **Authentication:** JSON Web Tokens (JWT)
* **Deployment:** Two Amazon EC2 instances (Nginx and pm2) behind an AWS Application Load Balancer
* **CI/CD:** GitHub Actions

```text
Browser
   |
   v
AWS Application Load Balancer
   |                    |
   v                    v
EC2 instance 1       EC2 instance 2
Nginx (port 80)      Nginx (port 80)
 /     -> React (pm2, port 3000)
 /api/ -> Express (pm2, port 5001)
   |                    |
   +---------+----------+
             v
       MongoDB Atlas
```

### Design patterns

* **Repository** (`backend/repositories/`): controllers access data through repository classes rather than Mongoose models directly
* **Template Method** (`BaseRepository.find`): a fixed query algorithm (filter, sort, populate) with hook methods that subclasses override
* **Facade** (`backend/facades/HomePageFacade.js`): a single interface for building the home page data
* **Builder** (`backend/builders/PatientQueryBuilder.js`): builds patient queries step by step

## Local Setup

### Requirements

* Node.js 22
* npm
* MongoDB Atlas database

### Installation

```bash
git clone https://github.com/IFN636-A2-Omar-Ivy-Chris/HospitalManagementApp
cd HospitalManagementApp
npm run install-all
```

Create a `.env` file inside the `backend` directory:

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

* Frontend: `http://localhost:3000`
* Backend: `http://localhost:5001`

Port `5000` is avoided because macOS uses it for AirPlay Receiver.

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Doctor | sarah.smith@hospital.com | `password` |
| Nurse | emily.brown@hospital.com | `password` |
| Pharmacist | pharmacist@hospital.com | `password` |

## Testing

### Unit and functional tests (Mocha, Chai, Sinon)

```bash
cd backend
npm test
```

Test files are in `backend/test/` and are named after the features they test. Test groups are named after their Jira user stories (for example `PHA-02 createMedication`). Non-functional security tests (`securityRoutes_test.js`, `authMiddleware_test.js`) check that every route requires login and that role restrictions match the user role table.

### API tests (Postman)

View the attached link https://www.postman.com/omarshakkaithompson-6418074/ifn636-a2/overview?sideView=agentMode  

Before you run these tests ensure you run the following: 

```bash
cd backend
npm run dev
```

## CI/CD Pipeline

The workflow in `.github/workflows/ci.yml` runs on every push and pull request:

1. **Test:** installs dependencies and runs the Mocha tests on `ubuntu-latest`
2. **Deploy** (pushes only, after the tests pass): runs on self-hosted runners on both EC2 instances, installs dependencies, builds the React frontend, writes `.env` from repository secrets, and restarts the app with pm2

## Deployment

The application runs on two EC2 instances behind an AWS Application Load Balancer. Access it through the load balancer's DNS name:

**URL:** `http://hma-alb-245743769.ap-southeast-2.elb.amazonaws.com`

Each instance runs Nginx on port 80, which serves the React build and forwards `/api/` requests to the Express backend. The DNS name stays the same when instances are stopped and restarted.

Both EC2 instances must be running for the app to be available. The load balancer only sends traffic to healthy instances, so the URL returns 503 if both are stopped. The instances are stopped when not in use to save cost.

## Known Limitations

* Discharging a patient removes the patient record rather than archiving it.
* Ward capacity and bed allocation are not managed.
* Load testing showed the free MongoDB Atlas M0 tier limits API throughput (about 40–100 requests per second); a dedicated tier or caching would be needed for production.
* Both EC2 instances are in the same availability zone, so the app tolerates a single instance failure but not a full zone outage. Placing the instances in different availability zones would remove this risk.
* Medication names are unique but case-sensitive, so names differing only in capitals are accepted.
* The application is publicly accessible over HTTP, so login details and tokens are not encrypted in transit. Production use would require an HTTPS listener on the load balancer with an AWS Certificate Manager (ACM) certificate.

## Version Control

Development is managed with Git and GitHub using feature branches and pull requests. Branches and commits include Jira issue keys so that work is linked to the HMA Jira project.