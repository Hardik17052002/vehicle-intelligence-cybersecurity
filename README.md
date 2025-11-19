# Enhancing Vehicle Intelligence and Security Through Cybersecurity with KALI Linux

## Project Overview

This project presents a **modular cybersecurity dashboard** built with **Kali Linux** to enhance vehicle intelligence and security. It provides **real-time scanning and monitoring of PC networks** and simulates vehicle diagnostics for **Software Defined Vehicles (SDV)**.

The dashboard demonstrates how advanced cybersecurity techniques can protect both traditional computing systems and modern connected vehicles. **PC scanning is live and interactive**, while **vehicle scanning is simulated** to showcase how threat detection would work without requiring actual vehicle hardware.

**Tested and optimized for Kali Linux running in VirtualBox** for maximum compatibility with security tools and ethical hacking labs.

---

## Key Features

- **Interactive Real-Time PC Scan:**  
  Scan network ports, inspect live connections, analyze website traffic, and detect running services from the web-based dashboard. Uses Kali's powerful network analysis tools.

- **Integrated Kali Linux Tools:**  
  Leverages industry-standard security tools including **Nmap** (port scanning), **Wireshark** (packet analysis), **Metasploit** (exploitation framework), **tcpdump** (packet capture), and more for comprehensive network and system analysis.

- **Vehicle Scan Simulation:**  
  Demonstrates **CAN bus/OBD-II cyber diagnostics** with simulated threat reports. Shows how vehicle communication protocols would be monitored, analyzed, and secured in real-world scenarios.

- **Extensible Architecture:**  
  Modular, well-organized codebase that is easily adaptable for **IoT systems**, **Software Defined Vehicles (SDV)**, and future integration with real vehicle hardware (ECUs, CAN bus adapters, OBD-II interfaces).

- **User-Friendly Web Dashboard:**  
  Simple, intuitive web-based UI for **real-time security status visualization** and actionable monitoring. Clean design for quick understanding of network and vehicle security posture.

---

## How to Run

### Requirements

- **Laptop/PC with VirtualBox installed**
- **Kali Linux (latest version) as a Virtual Machine**
- **Python 3.x**
- **Internet connection for dependency installation**

### Local Setup (on Kali Linux/VirtualBox)

Clone the repository
git clone https://github.com/Hardik17052002/vehicle-intelligence-cybersecurity.git

Navigate to the project directory
cd vehicle-intelligence-cybersecurity

(Optional) Install Python dependencies if requirements.txt exists
pip install -r requirements.txt

Start the main dashboard application
python3 app3.py

text

### Accessing the Dashboard

- Open your web browser within Kali Linux
- Navigate to: [**http://localhost:5000**](http://localhost:5000)
- Explore dashboard features:
  - **PC Scan Module:** Perform real-time network and port scans
  - **Vehicle Simulation Module:** View simulated CAN bus/OBD-II threat detection results
  - **Security Analysis:** Review detected threats, vulnerabilities, and recommendations

---

## Real-World Vehicle Deployment

To use this project with **real vehicle systems**, you will need the following hardware and software components:

### Hardware Requirements

- **Embedded Computing Board:**
  - NVIDIA Jetson Nano, Jetson Xavier, or similar
  - Raspberry Pi 4B or higher
  - Other edge computing platforms (Intel NUC, etc.)

- **Vehicle Communication Interface:**
  - **CAN Bus Adapter** (e.g., Kvaser Hybrid 2x, Peak PCAN)
  - **OBD-II USB Adapter** (e.g., ELM327 compatible device)
  - **Serial/USB cables** for connection

- **Connectivity:**
  - WiFi or LTE modem for remote monitoring and cloud integration
  - Secure network setup for data transmission

### Software Requirements

- **Linux drivers and libraries:**
  - `python-can` – Python CAN bus communication
  - `cantools` – CAN database handling and message decoding
  - socketCAN support for Linux kernel
  - Vehicle-specific diagnostic libraries (UDS, ISO-TP protocols)

- **Security and encryption:**
  - OpenSSL or similar for secure communication
  - TPM (Trusted Platform Module) support for hardware-level security (optional)

### Installation Steps for Real Vehicle

1. **Flash Linux/Kali onto embedded board** (Jetson, RPi)
2. **Install CAN/OBD-II drivers** and connect hardware adapters
3. **Install Python dependencies** on the board
4. **Configure vehicle ECU communication** (baud rates, CAN IDs, protocols)
5. **Deploy dashboard** and begin live vehicle monitoring
6. **(Optional) Set up cloud/remote monitoring** for fleet management

---

## Screenshots & Demo

### Dashboard Overview
<img width="940" height="336" alt="image" src="https://github.com/user-attachments/assets/efaba49f-bd2d-41ae-afb5-426cf06847fd" />


### Real-Time PC Scan Results
<img width="921" height="382" alt="image" src="https://github.com/user-attachments/assets/b560c620-894a-4b64-b893-f75b096235fe" />



### Vehicle Simulation Module
<img width="940" height="339" alt="image" src="https://github.com/user-attachments/assets/920d6302-1334-41b0-900e-c2c0f5d4a087" />


### Threat Detection & Alerts
<img width="938" height="344" alt="image" src="https://github.com/user-attachments/assets/79ca0dc6-9553-46d3-bb8f-3714fc4f0b9c" />


### Vulnerability Analysis
<img width="940" height="393" alt="image" src="https://github.com/user-attachments/assets/593cc89b-e950-4852-83f6-83b851b3e0b4" />


---

## Project Structure

## Project Structure

- **app3.py** – Main Flask web application
- **kali_tools/** – Kali security tool integrations
  - network_tools.py – Nmap, network scanning
  - pentest_listener.py – Penetration testing utilities
  - suricata_listener.py – IDS/threat detection
  - tshark_streamer.py – Packet analysis
- **templates/** – HTML pages for dashboard
  - index.html – Main landing page
  - dashboard.html – Central monitoring dashboard
  - network.html – Network analysis page
  - ids.html – Intrusion detection page
  - pentest.html – Penetration testing page
  - threatintel.html – Threat intelligence page
  - vulnerability.html – Vulnerability scanning page
  - collab.html – Collaboration/reporting page
- **static/** – CSS, JavaScript, and assets
  - style.css – Dashboard styling
  - app.js – Main JavaScript logic
  - js/ids.js – IDS-specific functionality
- **.gitignore** – Git ignore file
- **README.md** – This file


## Limitations

- **Vehicle scans are simulated** in the current version—no live CAN bus/OBD-II connection in this demo due to hardware constraints.
- **For real-world vehicle integration**, you must:
  - Obtain proper vehicle communication hardware and adapters
  - Understand automotive protocols (CAN, LIN, FlexRay, AUTOSAR)
  - Ensure electrical safety and vehicle diagnostic compliance
  - Follow manufacturer guidelines and legal requirements

- **PC scans require:**
  - Administrator/root privileges on the host machine
  - Proper firewall configuration and network permissions
  - Target authorization (ethical hacking only)

---

## Future Scope & Enhancements

- **Direct ECU/OBD-II/CAN Bus Integration:**  
  Live connection to real vehicle electronic control units and communication buses for continuous monitoring.

- **Machine Learning–Based Threat Detection:**  
  Implement anomaly detection, behavioral profiling, and classification models to identify zero-day threats and intrusion patterns.

- **Cloud Dashboard & Fleet Monitoring:**  
  Multi-vehicle cloud platform for centralized monitoring, alerting, and incident response across vehicle fleets.

- **Edge AI Hardware Support:**  
  Optimization for NVIDIA Jetson boards, TPUs, and other edge AI accelerators for faster threat detection.

- **Advanced Security Modules:**  
  Hardware TPM integration, encrypted communication channels, and secure key management.

- **Broader Tool Support:**  
  Integration of additional Kali tools (Burp Suite, Nuclei, custom exploits) and third-party security frameworks.

- **Mobile Application:**  
  Real-time alerts and dashboard access via mobile app (iOS/Android).

---

## Technology Stack

- **Backend:** Python 3.x, Flask
- **Frontend:** HTML5, CSS3, JavaScript
- **Security Tools:** Kali Linux, Nmap, Wireshark, Metasploit, tcpdump, Suricata
- **Platforms:** Linux (Kali), VirtualBox, NVIDIA Jetson (optional)
- **Protocols:** CAN, OBD-II, TCP/IP, UDP

---

## Installation & Troubleshooting

### Common Issues

**Issue:** Dashboard not loading at localhost:5000
- **Solution:** Ensure Flask is installed (`pip install flask`) and the app is running without errors. Check firewall settings.

**Issue:** Kali tools not found
- **Solution:** Verify Kali Linux installation is complete and tools are in system PATH. Update packages: `sudo apt-get update && sudo apt-get upgrade`

**Issue:** Permission denied errors
- **Solution:** Run with appropriate privileges: `sudo python3 app3.py` or ensure user is in proper groups.

---

## Usage Examples

### Example 1: Running a Real-Time PC Network Scan
1. Start the application: `python3 app3.py`
2. Navigate to Dashboard → Network Analysis
3. Enter target IP or subnet
4. Click "Start Scan" – Nmap will run live and display results

### Example 2: Viewing Simulated Vehicle Threats
1. Go to Dashboard → Vehicle Security
2. View simulated CAN bus message analysis
3. Check detected anomalies and threat scores
4. Review recommendations

### Example 3: Exporting Reports
1. Complete a scan or analysis
2. Click "Export Report" (if available)
3. Report saved as PDF/CSV for documentation

---

## Limitations & Disclaimer

This project is designed for **educational purposes, cybersecurity labs, and authorized security testing only**. Ensure you have proper authorization before scanning any networks or systems. Unauthorized access to computer systems is illegal.

---

## Author & Contact

**Hardik H S**  
MCA Graduate | Web Developer | Full Stack Developer | Cybersecurity Enthusiast  
**LinkedIn:** [www.linkedin.com/in/hardikhs1705](https://www.linkedin.com/in/hardikhs1705)  
