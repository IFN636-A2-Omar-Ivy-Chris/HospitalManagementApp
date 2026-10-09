Assessment name: Software development, testing and configuration

Overview:

Task description
The aim of this assessment is to simulate a real-world software development lifecycle by collaboratively developing, testing, and deploying an application using advanced OOP features, commonly used design patterns, API testing, functional testing, a CI/CD pipeline, load balancing, version control, and team collaboration. The project will also involve the preparation of a Requirements and Traceability Specification document. The submission template provides guidance and examples for preparing the report. All development activities and project artefacts should be clearly aligned and traceable across Jira, GitHub, and the deployed EC2 instance(s).

Since this is a group project, your group must choose one project from the projects previously developed by the group members in Assessment 1. The group will then collaboratively extend and further develop the selected project for this assessment.

Before selecting the project, you must first form your group. The groups are now available in Canvas. Please navigate to People → Ass2 Group and enrol yourself in a group. All members must mutually agree to form the group. Please discuss the project with your group members and establish clear expectations regarding individual responsibilities, contributions, communication, and collaboration. Please ensure your old project and the new project are available in your EC2 instance.

As you will be continuing an existing project from Assessment 1, you must extend the selected project; only the new functionalities that your group is developing will be assessed. All new functionalities should be clearly identified in the Requirements and Traceability Specification and appropriately linked to the relevant Jira items, GitHub implementation, testing, and deployed application.

Marking Criteria:
Requirements and Traceability Specification

High Distinction
Comprehensive and coherent specification. Scope, stakeholders and system boundaries are clearly defined. Functional and non-functional requirements are specific, meaningful and testable. User stories contain clear and verifiable acceptance criteria. Requirements are appropriately prioritised and changes are justified. Strong end-to-end traceability is demonstrated across requirements, Jira, GitHub, implementation and verification. Newly implemented functionality is clearly identified. Complete system diagram accurately represents the implemented system and follows appropriate notation.
10 to >8.53 pts

Application of Design Patterns and OOP Principles

High Distinction
Design patterns and OOP principles are appropriately selected, correctly implemented and meaningfully integrated into the backend. Each member's required implementation is clearly identifiable. Strong justification explains relevance to the associated requirements and design problems. Specific backend code provides convincing evidence. Implementation demonstrates meaningful technical complexity and strong understanding during demonstration.
10 to >8.5 pts

API Testing using Postman

High Distinction
Comprehensive testing of relevant backend API endpoints. Successful requests, meaningful invalid inputs, error handling and relevant edge cases are tested. Requests/responses clearly demonstrate expected behaviour and are traceable to relevant requirements.
4 to >3.41 pts

Functional Testing

High Distinction
Comprehensive functional testing of relevant backend functionality with clear pass/fail terminal evidence. Tests verify expected behaviour and meaningful failure/error conditions and are clearly associated with relevant requirements. Results are correctly interpreted and demonstrated.
4 to >3.41 pts

CI/CD Pipeline

High Distinction
Fully functional GitHub Actions CI/CD pipeline demonstrating successful automated workflow and deployment. Relevant stages/jobs execute successfully. EC2/PM2 evidence confirms required services are operational and the application is publicly accessible. Strong integration and understanding are demonstrated.
4 to >3.41 pts

Load Balancing and Load Testing

High Distinction
Two EC2 instances and AWS ALB are correctly configured and operational. Both targets are healthy and traffic distribution is convincingly demonstrated. At least two meaningful Apache Benchmark tests with different settings are conducted and compared. CloudWatch evidence is provided. Analysis correctly interprets performance changes, system response, reliability and relevant cloud implications.
4 to >3.4 pts

Team Collaboration

High Distinction
Team agreement clearly identifies individual responsibilities and contributions. Strong evidence of genuine collaborative development through meaningful and reasonably distributed GitHub commits, feature branches, pull requests, integration and management of merge conflicts where applicable. Individual contributions are traceable to requirements and implementation. Meetings and communication are evidenced. Reflection clearly identifies what worked, contribution/collaboration challenges and how they were addressed.
8 to >6.8 pts

Report

High Distinction
Professional, coherent and well-structured report accurately representing the implemented project. Technical evidence is appropriately selected and clearly explained rather than relying on screenshots alone. Strong consistency exists between report, requirements, implementation and demonstration. Conclusion meaningfully synthesises outcomes. Individual reflection clearly addresses a specific challenge, response, supporting evidence and future improvement. GenAI declaration/evidence log is complete and APA referencing is appropriately applied.



Report Template:

1.	Requirements and Traceability Specification 
1.1 Project Scope and Stakeholders
Briefly describe the problem the system addresses and its intended purpose. Identify the main stakeholders and user groups. Clearly state what is in scope and out of scope.
1.2 Functional Requirements
Identify the major functions the proposed system must provide. Assign a unique identifier to each functional requirement. Write requirements clearly and in a testable form. Link related functional requirements to the corresponding Jira Epic/Feature/User Story. Please indicate which functional requirements are newly implemented. We only evaluate the newly developed functions in this assessment. Each group member should implement at least one functional and one non-functional requirement.
1.3 Non-Functional Requirements
Define relevant quality requirements. Assign identifiers for each non-functional requirement. Where possible, specify measurable criteria rather than broad statements.
1.4 User Stories and Acceptance Criteria
Provide key user stories using an appropriate format, such as “As a [user], I want [function] so that [benefit].” Provide clear and verifiable acceptance criteria for important user stories. Ensure the stories are represented consistently in Jira.
1.5 Requirements Prioritisation
Prioritise requirements using an appropriate approach (You may adopt any approach). Briefly justify the priority of important requirements. Priorities in the document should correspond with the Jira backlog. Requirements-to-Implementation Alignment. Identify which system components, processes, interfaces, or interactions address each major requirement. Connect implemented requirements to relevant Jira items and GitHub evidence, such as issues, branches, commits, pull requests, or implemented components.
1.6 Requirements Changes and Evolution
Record significant requirements that were added, modified, removed, or reprioritised during development. Briefly explain why the change occurred and its impact on Jira, design, Figma, implementation, or deployment. The final document should represent the actual developed system, rather than only the original project plan.
1.7 Traceability Matrix
Requirement	Priority	Jira	GitHub	Verification
FR-01	Must	US-1.2	Issue #12/Commit	Demonstrated
FR-02	Should	US-2.1	Issue #18/Commit	Tested
NFR-01	Must	US-1.3	Issue #15	Security test
Provide a concise matrix connecting major project artefacts,
1.8 Complete System Diagram
Provide a complete system architecture diagram showing all components (frontend, backend, GitHub, database, cloud services (EC2, Load balancer), and any external APIs) and how they interact. Use clear labels and directional arrows to show data flow (This diagram should follow standard SysML notation).
Note: Do not include requirements simply to increase the size or apparent complexity of the project. Higher marks are awarded for well-defined, justified, testable requirements with clear end-to-end traceability across Jira, GitHub, implementation and demonstration.
2. Implementation and Design Pattern
2.1 Design pattern (Each group member should implement at least one design pattern)
Please explain the design pattern details including the relevance of the design pattern with your project and its association with the relevant requirement. Include specific backend code (screenshot) for the design pattern and provide your justification for choosing that design pattern. 
2.2 Implementation of OOP (Each group member should implement and demonstrate at least one OOP principle)
Please explain the details including the relevance of the OOP with your project and its association with the relevant requirement. Include specific backend code (screen shot) for the OOP concepts and provide justification for each OOP principle(s).

3. API Testing 
API Request Collections and Response for Backend Code (Provide screenshot) including error checking. All API endpoints should be relevant to your project and clearly associated with the relevant requirement.
4. Functional Testing 
Provide a pass / fail screenshot from the terminal for each backend function (such as create task, update task, errors etc.). All testing endpoints should be relevant to your project and clearly associated with the relevant requirement.

5. CI/CD Pipeline Setup
Provide workflow file (YML) screenshot. Provide a screenshot of EC2 server configuration (Only include pm2 status output table from the terminal). Provide a screenshot of the “Run Test” page from GitHub (where the job is running, and you can see the steps are passing or failing). Provide a few screenshots (at least four) of your application from the browser, highlighting the public IP.
6. Load Balancing and Load Testing
Deploy your application on two separate EC2 instances and configure an AWS Application Load Balancer (ALB) to distribute traffic between them. Provide evidence including (a) Screenshot of both EC2 instances in the Running state (from the AWS EC2 Instances console) (b) Screenshot of the Target Group showing both instances registered and healthy (Status: healthy) (c) Screenshot of the Application Load Balancer in the Active state, showing its DNS name (d) Screenshot confirming traffic distribution: access the ALB DNS in a browser (or use curl) multiple times and capture responses alternating between the two server instances.
Conduct load testing on your application using Apache Benchmark and interpret the results. You must run at least two tests with different concurrency/request settings and compare outcomes. Screenshot of the Apache Benchmark output for a baseline test. 
Identify and explain key metrics: Requests per second, Time per request, and Failed requests. Screenshot of a second load test with higher concurrency or request count. Compare results with the baseline and explain any differences observed. Screenshot of CloudWatch Metrics showing the CPU utilisation spike during load testing and any subsequent events that were triggered. Brief written analysis (3–5 sentences): Explain how the load balancer distributed traffic, system responded to increased load, demonstration about application reliability and cost-effectiveness in a cloud environment.
7. Team Collaboration
Include evidence of commit history (you can see the graph view of commits from GitHub), feature branches, pull requests, and merge conflicts. Team Meeting times and dates should be included in this section. Please also add team communication channel screen shot. Provide a brief reflection on team collaboration, including how responsibilities were shared, what worked well, any collaboration or contribution issues encountered, and how these issues were addressed within the team.
8. Conclusion
Write conclusion for your project
9. GenAI disclosure and Reflection
Complete the GenAI-use declaration and evidence log, including 'No GenAI used' if applicable.
Complete an individual reflection using one specific challenge, response, evidence and future improvement.
References:
Please use APA referencing style

