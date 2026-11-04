# Ordnerstruktur – ECInventoryHub

Vollständige Struktur aller versionierten Ordner und Dateien (Stand: 04.11.2026).
Nicht enthalten sind generierte bzw. ignorierte Ordner wie `node_modules/`, `target/`, `dist/` und `.idea/`.

## Überblick

| Ordner | Inhalt |
|---|---|
| `.github/workflows/` | CI/CD: Maven-Build, SonarCloud-Analysen, Deployment |
| `backend/` | Spring-Boot-Backend (Java, Maven) |
| `backend/src/main/java/ropold/backend/` | Controller, DTOs, Exceptions, Models, Repositories, Security, Services |
| `backend/src/main/resources/db/` | SQL-Schema, Dummy-Daten, Admin-Skript |
| `backend/src/test/` | Unit- und Integrationstests |
| `docs/` | Projektdokumentation |
| `frontend/` | React-Frontend (TypeScript, Vite) |
| `frontend/src/components/` | Komponenten je Bereich (assignment, device, employee, location) sowie DTOs, Models, Styles, Utils |
| `frontend/src/assets/` | Bilder, Logos, Länderflaggen |

## Struktur

```
ECInventoryHub/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       ├── maven.yml
│       ├── sonar-backend.yml
│       └── sonar-frontend.yml
├── backend/
│   ├── .mvn/
│   │   └── wrapper/
│   │       └── maven-wrapper.properties
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── ropold/
│   │   │   │       └── backend/
│   │   │   │           ├── controller/
│   │   │   │           │   ├── AssignmentController.java
│   │   │   │           │   ├── DeviceController.java
│   │   │   │           │   ├── EmployeeController.java
│   │   │   │           │   ├── LocationController.java
│   │   │   │           │   ├── MboxController.java
│   │   │   │           │   └── UserController.java
│   │   │   │           ├── dto/
│   │   │   │           │   ├── AssignmentDTO.java
│   │   │   │           │   ├── AssignmentFileDTO.java
│   │   │   │           │   ├── DeviceDTO.java
│   │   │   │           │   ├── DeviceFileDTO.java
│   │   │   │           │   ├── EmployeeDTO.java
│   │   │   │           │   └── LocationDTO.java
│   │   │   │           ├── exception/
│   │   │   │           │   ├── badrequestexceptions/
│   │   │   │           │   │   └── InvalidAssignmentDatesException.java
│   │   │   │           │   ├── conflictexceptions/
│   │   │   │           │   │   ├── DeviceAlreadyAssignedException.java
│   │   │   │           │   │   ├── DeviceHasAssignmentsException.java
│   │   │   │           │   │   ├── DeviceIdentifierAlreadyExistsException.java
│   │   │   │           │   │   ├── EmployeeHasAssignmentsException.java
│   │   │   │           │   │   └── LocationHasDevicesException.java
│   │   │   │           │   ├── notfoundexceptions/
│   │   │   │           │   │   ├── AccessDeniedException.java
│   │   │   │           │   │   ├── AssignmentFileNotFoundException.java
│   │   │   │           │   │   ├── AssignmentNotFoundException.java
│   │   │   │           │   │   ├── DeviceFileNotFoundException.java
│   │   │   │           │   │   ├── DeviceNotFoundException.java
│   │   │   │           │   │   ├── EmployeeNotFoundException.java
│   │   │   │           │   │   ├── LocationNotFoundException.java
│   │   │   │           │   │   └── UserNotFoundException.java
│   │   │   │           │   ├── ErrorResponse.java
│   │   │   │           │   └── GlobalExceptionHandler.java
│   │   │   │           ├── model/
│   │   │   │           │   ├── AssignmentFileModel.java
│   │   │   │           │   ├── AssignmentModel.java
│   │   │   │           │   ├── Department.java
│   │   │   │           │   ├── DeviceFileModel.java
│   │   │   │           │   ├── DeviceModel.java
│   │   │   │           │   ├── DeviceStatus.java
│   │   │   │           │   ├── DeviceType.java
│   │   │   │           │   ├── EmployeeModel.java
│   │   │   │           │   ├── LocationModel.java
│   │   │   │           │   ├── MoveDirection.java
│   │   │   │           │   ├── Role.java
│   │   │   │           │   └── UserModel.java
│   │   │   │           ├── repository/
│   │   │   │           │   ├── AssignmentFileRepository.java
│   │   │   │           │   ├── AssignmentRepository.java
│   │   │   │           │   ├── DeviceFileRepository.java
│   │   │   │           │   ├── DeviceRepository.java
│   │   │   │           │   ├── EmployeeRepository.java
│   │   │   │           │   ├── LocationRepository.java
│   │   │   │           │   └── UserRepository.java
│   │   │   │           ├── security/
│   │   │   │           │   └── SecurityConfig.java
│   │   │   │           ├── service/
│   │   │   │           │   ├── AssignmentFileService.java
│   │   │   │           │   ├── AssignmentService.java
│   │   │   │           │   ├── CloudinaryService.java
│   │   │   │           │   ├── DeviceFileService.java
│   │   │   │           │   ├── DeviceService.java
│   │   │   │           │   ├── EmployeeService.java
│   │   │   │           │   ├── ImageUploadUtil.java
│   │   │   │           │   ├── LocationService.java
│   │   │   │           │   └── UserService.java
│   │   │   │           └── BackendApplication.java
│   │   │   └── resources/
│   │   │       ├── db/
│   │   │       │   ├── admin.sql
│   │   │       │   ├── sql_dummy_insert.sql
│   │   │       │   └── sql_schema.sql
│   │   │       ├── application.properties
│   │   │       └── TODO_CSRF.md
│   │   └── test/
│   │       ├── java/
│   │       │   └── ropold/
│   │       │       └── backend/
│   │       │           ├── controller/
│   │       │           │   ├── AssignmentControllerIntegrationTest.java
│   │       │           │   ├── DeviceControllerIntegrationTest.java
│   │       │           │   ├── EmployeeControllerIntegrationTest.java
│   │       │           │   ├── LocationControllerIntegrationTest.java
│   │       │           │   ├── MBoxControllerIntegrationTest.java
│   │       │           │   └── UserControllerIntegrationTest.java
│   │       │           ├── dto/
│   │       │           │   ├── AssignmentDTOTest.java
│   │       │           │   ├── AssignmentFileDTOTest.java
│   │       │           │   ├── DeviceDTOTest.java
│   │       │           │   ├── DeviceFileDTOTest.java
│   │       │           │   ├── EmployeeDTOTest.java
│   │       │           │   └── LocationDTOTest.java
│   │       │           ├── exception/
│   │       │           │   └── GlobalExceptionHandlerTest.java
│   │       │           ├── security/
│   │       │           │   └── SecurityConfigTest.java
│   │       │           ├── service/
│   │       │           │   ├── AssignmentFileServiceTest.java
│   │       │           │   ├── AssignmentServiceTest.java
│   │       │           │   ├── CloudinaryServiceTest.java
│   │       │           │   ├── DeviceFileServiceTest.java
│   │       │           │   ├── DeviceServiceTest.java
│   │       │           │   ├── EmployeeServiceTest.java
│   │       │           │   ├── ImageUploadUtilTest.java
│   │       │           │   ├── LocationServiceTest.java
│   │       │           │   └── UserServiceTest.java
│   │       │           └── BackendApplicationTests.java
│   │       └── resources/
│   │           └── application.properties
│   ├── .gitattributes
│   ├── .gitignore
│   └── pom.xml
├── docs/
│   └── ORDNERSTRUKTUR.md
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── flags/
│   │   │   │   ├── de.svg
│   │   │   │   ├── es.svg
│   │   │   │   ├── fr.svg
│   │   │   │   ├── gb.svg
│   │   │   │   ├── it.svg
│   │   │   │   ├── pl.svg
│   │   │   │   ├── pt.svg
│   │   │   │   ├── ru.svg
│   │   │   │   └── tr.svg
│   │   │   ├── assignment-logo.svg
│   │   │   ├── company-pixa.png
│   │   │   ├── ec-logo.png
│   │   │   ├── employee-logo.png
│   │   │   ├── error-404.jpg
│   │   │   ├── github-logo.webp
│   │   │   ├── home-logo.jpg
│   │   │   ├── laptop-logo.png
│   │   │   ├── laptop-logo2.svg
│   │   │   ├── PostgreSQL-Elephant.png
│   │   │   ├── user-icon.png
│   │   │   └── world-quartet-logo.jpg
│   │   ├── components/
│   │   │   ├── assignment/
│   │   │   │   ├── AddNewAssignment.tsx
│   │   │   │   ├── AssignmentCard.tsx
│   │   │   │   ├── AssignmentDetails.tsx
│   │   │   │   ├── AssignmentForm.tsx
│   │   │   │   ├── Assignments.tsx
│   │   │   │   └── EditAssignment.tsx
│   │   │   ├── device/
│   │   │   │   ├── AddNewDevice.tsx
│   │   │   │   ├── DeviceCard.tsx
│   │   │   │   ├── DeviceDetails.tsx
│   │   │   │   ├── DeviceForm.tsx
│   │   │   │   ├── Devices.tsx
│   │   │   │   └── EditDevice.tsx
│   │   │   ├── dto/
│   │   │   │   ├── AssignmentDTO.ts
│   │   │   │   ├── AssignmentFileDTO.ts
│   │   │   │   ├── DeviceDTO.ts
│   │   │   │   ├── DeviceFileDTO.ts
│   │   │   │   ├── EmployeeDTO.ts
│   │   │   │   └── LocationDTO.ts
│   │   │   ├── employee/
│   │   │   │   ├── AddNewEmployee.tsx
│   │   │   │   ├── EditEmployee.tsx
│   │   │   │   ├── EmployeeCard.tsx
│   │   │   │   ├── EmployeeDetails.tsx
│   │   │   │   ├── EmployeeForm.tsx
│   │   │   │   └── Employees.tsx
│   │   │   ├── location/
│   │   │   │   ├── AddNewLocation.tsx
│   │   │   │   ├── EditLocation.tsx
│   │   │   │   ├── LocationCard.tsx
│   │   │   │   ├── LocationDetails.tsx
│   │   │   │   ├── Locations.tsx
│   │   │   │   ├── LocationsForm.tsx
│   │   │   │   ├── MapBoxCard.tsx
│   │   │   │   └── MapBoxDetails.tsx
│   │   │   ├── models/
│   │   │   │   ├── AssignmentFileModel.ts
│   │   │   │   ├── AssignmentModel.ts
│   │   │   │   ├── DeviceFileModel.ts
│   │   │   │   ├── DeviceModel.ts
│   │   │   │   ├── EmployeeModel.ts
│   │   │   │   ├── LocationModel.ts
│   │   │   │   └── UserModel.ts
│   │   │   ├── styles/
│   │   │   │   ├── assignment/
│   │   │   │   │   └── AssignmentCard.css
│   │   │   │   ├── device/
│   │   │   │   │   └── DeviceCard.css
│   │   │   │   ├── employee/
│   │   │   │   │   └── EmployeeCard.css
│   │   │   │   ├── location/
│   │   │   │   │   └── LocationCard.css
│   │   │   │   ├── Buttons.css
│   │   │   │   ├── CardBadge.css
│   │   │   │   ├── Details.css
│   │   │   │   ├── FormStyles.css
│   │   │   │   ├── MapBox.css
│   │   │   │   ├── Navbar.css
│   │   │   │   ├── Popup.css
│   │   │   │   ├── Profile.css
│   │   │   │   ├── SearchBar.css
│   │   │   │   └── Welcome.css
│   │   │   ├── utils/
│   │   │   │   ├── ComponentsFunctions.tsx
│   │   │   │   ├── DeviceFilters.ts
│   │   │   │   ├── FlagImages.ts
│   │   │   │   ├── LocationDeviceStats.ts
│   │   │   │   ├── MapboxGeocoding.ts
│   │   │   │   └── TranslatedInfo.ts
│   │   │   ├── CardWarning.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NoPermissionPopup.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── Welcome.tsx
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── .gitignore
├── Dockerfile
├── README.md
└── sonar-project.properties
```
