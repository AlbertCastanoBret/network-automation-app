Network Automation App
======================

This project is a network automation tool built using **Flask** for the backend and **React** (with Vite) for the frontend. The backend interacts with network devices, gathering information such as status, interfaces, and ARP tables, and allows the execution of CLI commands via APIs. The frontend provides a graphical interface to view the gathered information and perform network operations.

Features
--------

-   Device and host management
-   BGP neighbor information
-   CLI command execution for devices
-   Device configuration backup and restoration
-   Device status monitoring
-   Frontend built with React and Chart.js for visualizations

Project Structure
-----------------

The project is divided into two main parts:

-   **Backend**: Flask-based, handles APIs and communication with network devices.
    -   Key files:
        -   `app.py`: Entry point for the backend, initializes Flask, SQLAlchemy, and API routes.
        -   `api/DeviceRoutes.py`: API routes for managing devices.
        -   `api/HostRoutes.py`: API routes for managing hosts.
        -   `services/DeviceManager.py`: Handles device interactions, such as retrieving device configurations and running CLI commands.
        -   `data/devices.yaml`: Contains the initial list of devices with their configuration (IP, hostname, etc.).
-   **Frontend**: Built with React, provides a user interface for device management.
    -   Key files:
        -   `src/components/`: Contains reusable React components for the UI.
        -   `src/pages/`: Contains the main page views (HomePage, DevicesPage, etc.).
        -   `src/routes/AppRouter.jsx`: Manages routing between pages.
        -   `package.json`: Lists the project's dependencies and scripts.

* * * * *

Requirements
------------

To run this project, ensure you have the following installed:

-   Python 3.x
-   Node.js and npm
-   SQLite

* * * * *

Getting Started
---------------

### 1\. Clone the Repository
```bash
git clone https://github.com/AlbertCastanoBret/network-automation-app
cd network-automation-app`
````

### 2\. Backend Setup

1.  Navigate to the backend folder:
```bash
    `cd network-automation-app_backend`
```
2.  Install Python dependencies (it's recommended to create a virtual environment):
```bash
    `python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt  # Ensure you create this file with the needed packages`
```
3.  Run the Flask app:
```bash
    `python app.py`
```
This will start the Flask backend server.

### 3\. Frontend Setup

1.  Navigate to the frontend folder:
```bash
    `cd ../network-automation-app_frontend`
```
2.  Install dependencies using npm:
```bash
    `npm install`
```
3.  Start the development server:
```bash
    `npm run dev`
```
This will start the Vite development server for the React frontend.

### 4\. Access the Application

-   **Frontend**: Open your browser and navigate to `http://localhost:3000`
-   **Backend**: API endpoints can be accessed at `http://localhost:5000`

### 5\. Running the Database

The backend uses **SQLite** for storing device and host information. Upon running the Flask application, the `database.db` file will be automatically created under the `instance` directory.

* * * * *

Device Configuration
--------------------

You can add new network devices in the `network-automation-app_backend/data/devices.yaml` file. Each device entry follows this structure:
```yaml
- id: 1
  ip_address: 192.168.0.28
  hostname: FirstRouter
  username: albert
  password: albert
  os: ios
  device_type: cisco_xe
  ssh_port: 22
  vendor: cisco`
```
* * * * *

API Endpoints
-------------

The backend provides several API endpoints for interacting with devices and hosts:

-   **GET** `/devices`: Retrieves all devices.
-   **GET** `/devices/<device_id>`: Retrieves a specific device by ID.
-   **GET** `/devices/status`: Retrieves the status of all devices.
-   **POST** `/devices/cli/<device_id>`: Executes CLI commands on a device.
-   **POST** `/devices/backup/<device_id>`: Creates a backup of the device configuration.
-   **POST** `/devices/restore/<device_id>/<backup_id>`: Restores a device configuration from a backup.

For more detailed API documentation, please refer to the source code in `api/DeviceRoutes.py` and `api/HostRoutes.py`.

* * * * *

License
-------

This project is licensed under the MIT License.
