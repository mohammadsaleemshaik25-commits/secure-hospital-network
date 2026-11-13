# Secure Hospital Network

An enterprise-grade, academic demonstration of healthcare network infrastructure, cybersecurity controls, and OSI model protocol simulations. The system pairs a high-performance **Spring Boot 3.3** REST backend with a modern **React 19 + Vite** monitoring dashboard.

---

## 1. Project Overview & Architecture

The Secure Hospital Network simulates critical data communication pipelines within a multi-departmental medical facility. The architecture bridges physical network engineering (demonstrated in Cisco Packet Tracer) with software protocol simulations and end-to-end cryptographic protection for electronic protected health information (ePHI).

### Architectural Topology
* **Core Router (`192.168.1.1`)**: Central hospital gateway routing traffic between 8 isolated medical department subnets (`192.168.1.10` to `192.168.1.80`).
* **Multi-Layer Protocol Pipeline**:
  1. **Application Layer**: AES-256-GCM authenticated clinical record encryption and decryption with integrity verification.
  2. **Transport Layer**: State-machine TCP 3-way handshake simulator and connectionless UDP datagram delivery with packet loss telemetry.
  3. **Network Layer**: Shortest-path routing calculations using Dijkstra's algorithm and Distance Vector (Bellman-Ford) routing tables.
  4. **Data Link Layer**: Frame boundary stuffing (Character/DLE stuffing and HDLC Bit stuffing), error detection using CRC-16 and CRC-32 polynomials, and flow control with ARQ Sliding Window / Go-Back-N simulators.

```
┌────────────────────────────────────────────────────────┐
│             Secure Hospital Network (Frontend)         │
│             React 19 • Vite • Tailwind CSS             │
└───────────────────────────┬────────────────────────────┘
                            │ REST APIs / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│             Spring Boot Backend (Port 8083)            │
│  ├── Security & Cryptography (AES-256-GCM)             │
│  ├── Transport Simulation (TCP / UDP)                  │
│  ├── Routing Engine (Dijkstra / Distance Vector)       │
│  ├── Framing & Error Control (DLE, Bit, CRC, ARQ)      │
│  └── In-Memory Clinical Store (H2 Database)            │
└────────────────────────────────────────────────────────┘
```

---

## 2. Technologies Used

### Backend
* **Java 17** (LTS)
* **Spring Boot 3.3.0** (Spring Web, Spring Data JPA)
* **H2 Database** (In-memory SQL storage)
* **Java Cryptography Architecture (JCA)**: AES/GCM/NoPadding (256-bit key, 128-bit authentication tag, 96-bit random IV)
* **Apache Maven 3.9+**
* **JUnit 5, Mockito & MockMvc** (73 automated unit & integration tests)

### Frontend
* **React 19.3**
* **Vite 8**
* **Tailwind CSS v4** (Royal Indigo `#8B7CF6`, Soft Lavender `#A99CFB`, Emerald `#10B981`)
* **Axios** (With base URL normalization and 60-second timeouts)
* **Lucide React** (Vector icons)
* **React Router DOM 7**

---

## 3. Local Setup Instructions

### Prerequisites
* **Java Development Kit (JDK) 17** or higher
* **Apache Maven 3.9+**
* **Node.js 18+** & **npm**

### Step 1: Clone Repository & Setup AES Key
Generate a secure 256-bit (32-byte) Base64 secret key for AES-256-GCM.

In **PowerShell**:
```powershell
$bytes = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$aesKey = [Convert]::ToBase64String($bytes)
$env:HOSPITAL_AES_KEY = $aesKey
Write-Host "Generated Key: $aesKey"
```

In **Linux / macOS (Bash)**:
```bash
export HOSPITAL_AES_KEY=$(openssl rand -base64 32)
echo "Generated Key: $HOSPITAL_AES_KEY"
```

### Step 2: Build & Start the Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/secure-hospital-network-0.0.1-SNAPSHOT.jar
```
* The Spring Boot backend starts on `http://localhost:8083`.
* Health check endpoint: `http://localhost:8083/api/health`.

### Step 3: Install & Start the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
* The React dashboard starts on `http://localhost:5173`.
* The Vite development proxy automatically forwards `/api` requests to `http://localhost:8083`.

---

## 4. Deployment Architecture & Environment Variables

The project is structured for dual-platform deployment:
* **Frontend**: Deployed on **Vercel** (Static SPA).
* **Backend**: Deployed on **Render** (Native Java Web Service).

### Render Web Service Configuration (Backend)
* **Environment**: `Java`
* **Root Directory**: `backend`
* **Build Command**: `mvn clean package -DskipTests`
* **Start Command**: `java -jar target/secure-hospital-network-0.0.1-SNAPSHOT.jar`
* **Health Check Path**: `/api/health`

#### Render Environment Variables:
| Variable | Value | Description |
|---|---|---|
| `PORT` | *(Auto-assigned)* | Dynamic internal port assigned by Render. Handled via `${PORT:8083}`. |
| `HOSPITAL_AES_KEY` | *(Secret 32-byte Base64 key)* | Secure key for AES-256-GCM. **Never commit or expose.** |
| `CORS_ALLOWED_ORIGINS` | `https://<your-app>.vercel.app,http://localhost:5173` | Comma-separated list of exact allowed origins. |
| `JAVA_VERSION` | `17` | Directs Render to provision OpenJDK 17 runtime. |

### Vercel Project Configuration (Frontend)
* **Framework Preset**: `Vite`
* **Root Directory**: `frontend`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install`
* **SPA Routing**: Handled via [`frontend/vercel.json`](./frontend/vercel.json) rewrites to prevent 404s on page refresh.

#### Vercel Environment Variables:
| Variable | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://<your-backend>.onrender.com` | Base URL of deployed backend. Normalizes `/api` automatically. |

---

## 5. Cisco Packet Tracer Instructions

The physical network topology model is designed in Cisco Packet Tracer (`.pkt` format) to represent hospital subnets:

1. **Opening the Topology**:
   * Launch **Cisco Packet Tracer (v8.2+)**.
   * Open the `.pkt` file located in the project root.
2. **Topology Verification**:
   * Central Core Router connects departmental switches:
     * Emergency Department (`192.168.1.10`)
     * Intensive Care Unit (`192.168.1.20`)
     * Surgery & Operating Theaters (`192.168.1.30`)
     * Radiology & Medical Imaging (`192.168.1.40`)
     * Clinical Laboratory (`192.168.1.50`)
     * Inpatient Cardiology Ward (`192.168.1.60`)
     * Outpatient Pharmacy (`192.168.1.70`)
     * Hospital Administration & IT (`192.168.1.80`)
3. **Connectivity Tests**:
   * In Simulation mode or Real-Time mode, perform `ping 192.168.1.1` from any workstation to confirm gateway reachability.
   * Verify inter-VLAN routing across medical departments.

---

## 6. Academic Prototype & Database Persistence Notice

> [!NOTE]
> **In-Memory Database**: This application utilizes an embedded in-memory **H2 Database** (`jdbc:h2:mem:hospitaldb`) designed specifically for laboratory evaluation, academic demonstrations, and zero-configuration grading.
>
> * **Automatic Seeding**: Initial hospital department configurations are pre-populated on startup by [`DataInitializer.java`](./backend/src/main/java/com/hospital/network/DataInitializer.java).
> * **Ephemeral Storage**: When deployed on free-tier container platforms (such as Render), services enter sleep mode after 15 minutes of inactivity. Any dynamic runtime records or mock TCP connection states created during a live session will reset upon cold-start restart.
> * **Render Cold Starts**: Initial requests to a sleeping Render backend may take 30–50 seconds to boot the JVM. The frontend Axios timeout is set to 60 seconds to accommodate this grace period.
