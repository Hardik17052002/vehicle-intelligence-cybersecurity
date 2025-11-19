document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 IDS Panel DOM loaded, initializing...');

    // Check if Socket.IO is available
    if (typeof io === 'undefined') {
        console.error('❌ Socket.IO client library not loaded!');
        alert('Socket.IO library failed to load. Please check your internet connection and refresh.');
        return;
    }

    console.log('✅ Socket.IO client library loaded successfully');

    // SIMULATED IDS VARIABLES AND FUNCTIONS
    const THREAT_TYPES = [
        "Port Scan",
        "SQL Injection Attempt", 
        "XSS Attack",
        "Brute Force Attempt",
        "Malware Beacon",
        "Data Exfiltration",
        "DDoS Attack",
        "Credential Stuffing",
        "Command Injection",
        "File Upload Exploit"
    ];
    
    const SOURCE_IPS = [
        "192.168.1.100",
        "10.0.0.15",
        "45.33.12.89",
        "172.16.0.23",
        "104.17.32.10",
        "203.0.113.42",
        "198.51.100.67",
        "185.199.108.153"
    ];
    
    let monitoringInterval;
    let networkUpdateInterval;
    let packetCounter = 0;
    let threatCounter = 0;
    let sources = new Set();
    let networkNodes = [];
    
    // REAL-TIME IDS VARIABLES
    let realtimeThreatCounter = 0;
    let realtimeEventCounter = 0;
    let idsActive = false;
    
    // CRITICAL FIX: Initialize SocketIO connection with proper config
    console.log('🔌 Initializing Socket.IO connection...');
    
    // FIXED: Use explicit origin and proper transport config
    const socket = io(window.location.protocol + '//' + window.location.host, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: false
    });
    
    // ATTACH EVENT LISTENERS
    console.log('🔗 Attaching event listeners...');
    
    const startMonitoringBtn = document.getElementById('startMonitoring');
    const stopMonitoringBtn = document.getElementById('stopMonitoring');
    const blockAllBtn = document.getElementById('blockAll');
    const startRealtimeBtn = document.getElementById('startRealtimeIDS');
    const stopRealtimeBtn = document.getElementById('stopRealtimeIDS');
    const clearAlertsBtn = document.getElementById('clearRealtimeAlerts');

    if (startMonitoringBtn) {
        startMonitoringBtn.addEventListener('click', function() {
            console.log('🎯 Start Monitoring clicked');
            startMonitoring();
        });
    } else {
        console.error('❌ startMonitoring button not found');
    }
    
    if (stopMonitoringBtn) {
        stopMonitoringBtn.addEventListener('click', function() {
            console.log('🛑 Stop Monitoring clicked');
            stopMonitoring();
        });
    }
    
    if (blockAllBtn) {
        blockAllBtn.addEventListener('click', function() {
            console.log('🚫 Block All Threats clicked');
            blockAllThreats();
        });
    }
    
    // Real-time IDS event listeners
    if (startRealtimeBtn) {
        startRealtimeBtn.addEventListener('click', function() {
            console.log('🚀 Start Real-Time IDS clicked');
            startRealtimeIDS();
        });
    } else {
        console.error('❌ startRealtimeIDS button not found');
    }
    
    if (stopRealtimeBtn) {
        stopRealtimeBtn.addEventListener('click', function() {
            console.log('⏹️ Stop Real-Time IDS clicked');
            stopRealtimeIDS();
        });
    }
    
    if (clearAlertsBtn) {
        clearAlertsBtn.addEventListener('click', function() {
            console.log('🗑️ Clear Real-Time Alerts clicked');
            clearRealtimeAlerts();
        });
    }
    
    // NETWORK MAP FUNCTIONS - NEW ADDITION
    function initializeNetworkMap() {
        console.log('🗺️ Initializing network map...');
        const networkMap = document.getElementById('networkMap');
        if (!networkMap) {
            console.error('❌ networkMap element not found');
            return;
        }
        
        // Clear existing content
        networkMap.innerHTML = '';
        networkNodes = [];
        
        // Create network nodes representing different parts of the vehicle network
        const vehicleNodes = [
            { id: 'gateway', name: 'Vehicle Gateway', x: 50, y: 50, color: '#00b8ff', size: 28 },
            { id: 'engine', name: 'Engine ECU', x: 25, y: 25, color: '#00ff88', size: 24 },
            { id: 'brake', name: 'Brake Controller', x: 75, y: 25, color: '#00ff88', size: 24 },
            { id: 'transmission', name: 'Transmission', x: 25, y: 75, color: '#00ff88', size: 24 },
            { id: 'body', name: 'Body Control', x: 75, y: 75, color: '#00ff88', size: 24 },
            { id: 'security', name: 'Security Module', x: 90, y: 50, color: '#ff0055', size: 26 },
            { id: 'infotainment', name: 'Infotainment', x: 50, y: 15, color: '#ffaa00', size: 22 },
            { id: 'obd', name: 'OBD-II Port', x: 15, y: 50, color: '#bd00ff', size: 20 }
        ];
        
        // Create nodes
        vehicleNodes.forEach(node => {
            const nodeElement = createNetworkNode(networkMap, node);
            networkNodes.push({ element: nodeElement, data: node, status: 'normal' });
        });
        
        // Create connections
        createNetworkConnections(networkMap);
        
        console.log('✅ Network map initialized with', networkNodes.length, 'nodes');
    }
    
    function createNetworkNode(container, nodeData) {
        const node = document.createElement('div');
        node.className = 'map-node';
        node.id = `node-${nodeData.id}`;
        node.title = nodeData.name;
        
        // Calculate position as percentage of container
        node.style.left = `${nodeData.x}%`;
        node.style.top = `${nodeData.y}%`;
        node.style.backgroundColor = nodeData.color;
        node.style.width = `${nodeData.size}px`;
        node.style.height = `${nodeData.size}px`;
        
        // Add click interaction
        node.addEventListener('click', () => {
            console.log(`🖱️ Clicked on ${nodeData.name}`);
            showNodeDetails(nodeData);
        });
        
        container.appendChild(node);
        return node;
    }
    
    function createNetworkConnections(container) {
        // Define connections between nodes (from gateway to other nodes)
        const connections = [
            { from: 'gateway', to: 'engine' },
            { from: 'gateway', to: 'brake' },
            { from: 'gateway', to: 'transmission' },
            { from: 'gateway', to: 'body' },
            { from: 'gateway', to: 'security' },
            { from: 'gateway', to: 'infotainment' },
            { from: 'gateway', to: 'obd' }
        ];
        
        connections.forEach(conn => {
            const fromNode = document.getElementById(`node-${conn.from}`);
            const toNode = document.getElementById(`node-${conn.to}`);
            
            if (fromNode && toNode) {
                createConnectionLine(container, fromNode, toNode);
            }
        });
    }
    
    function createConnectionLine(container, fromElement, toElement) {
        const line = document.createElement('div');
        line.className = 'map-line';
        
        const containerRect = container.getBoundingClientRect();
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Calculate center positions relative to container
        const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
        const toX = toRect.left + toRect.width / 2 - containerRect.left;
        const toY = toRect.top + toRect.height / 2 - containerRect.top;
        
        // Calculate distance and angle
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Position and style the line
        line.style.left = `${fromX}px`;
        line.style.top = `${fromY}px`;
        line.style.width = `${distance}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.zIndex = '1';
        
        container.appendChild(line);
        return line;
    }
    
    function showNodeDetails(nodeData) {
        const details = `
Network Node: ${nodeData.name}
Node ID: ${nodeData.id}
Status: Active
Security Level: ${nodeData.color === '#ff0055' ? 'High Security' : 'Standard'}
        `.trim();
        
        alert(details);
    }
    
    function updateNetworkMap() {
        // Simulate network activity and threats
        networkNodes.forEach(node => {
            const element = node.element;
            const data = node.data;
            
            // Random chance of showing activity
            if (Math.random() < 0.3) {
                // Show activity with pulsing effect
                element.style.animation = 'pulse 1s ease-in-out';
                setTimeout(() => {
                    element.style.animation = '';
                }, 1000);
            }
            
            // Random chance of showing threat
            if (Math.random() < 0.1 && threatCounter > 0) {
                // Show threat with red flash
                const originalColor = data.color;
                element.style.backgroundColor = '#ff0055';
                element.style.boxShadow = '0 0 20px rgba(255, 0, 85, 0.8)';
                
                setTimeout(() => {
                    element.style.backgroundColor = originalColor;
                    element.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.6)';
                }, 2000);
            }
        });
    }
    
    // Add CSS animation for pulse effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.3); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // SIMULATED IDS FUNCTIONS
    function startMonitoring() {
        console.log('🚀 Starting simulated monitoring...');
        const trafficLog = document.getElementById('trafficLog');
        if (!trafficLog) {
            console.error('❌ trafficLog element not found');
            return;
        }
        
        trafficLog.innerHTML = '> Starting network monitoring...\n> IDS sensors activated\n> Real-time analysis enabled\n> Initializing network map...\n';
        
        // Initialize network map when monitoring starts
        initializeNetworkMap();
        
        monitoringInterval = setInterval(() => {
            packetCounter++;
            const packetCountElement = document.getElementById('packetCount');
            if (packetCountElement) {
                packetCountElement.textContent = packetCounter;
            }
            
            const sourceIp = SOURCE_IPS[Math.floor(Math.random() * SOURCE_IPS.length)];
            sources.add(sourceIp);
            const sourceCountElement = document.getElementById('sourceCount');
            if (sourceCountElement) {
                sourceCountElement.textContent = sources.size;
            }
            
            if (Math.random() > 0.7) {
                threatCounter++;
                const threatCountElement = document.getElementById('threatCount');
                if (threatCountElement) {
                    threatCountElement.textContent = threatCounter;
                }
                
                const threatType = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
                const alertMsg = `${threatType} from ${sourceIp}`;
                
                trafficLog.innerHTML += `\n<span style="color:#ff0055; font-weight:bold;">[THREAT] ${alertMsg}</span>`;
                addAlert(alertMsg);
            } else {
                trafficLog.innerHTML += `\n<span style="color:#00b8ff;">[INFO] Packet from ${sourceIp}</span>`;
            }
            
            trafficLog.scrollTop = trafficLog.scrollHeight;
        }, 1200);
        
        // Start network map updates
        networkUpdateInterval = setInterval(updateNetworkMap, 2000);
    }
    
    function stopMonitoring() {
        console.log('⏹️ Stopping monitoring...');
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }
        if (networkUpdateInterval) {
            clearInterval(networkUpdateInterval);
            networkUpdateInterval = null;
        }
        const trafficLog = document.getElementById('trafficLog');
        if (trafficLog) {
            trafficLog.innerHTML += '\n<span style="color:#ffaa00;">[SYSTEM] Monitoring stopped</span>';
        }
    }
    
    function blockAllThreats() {
        console.log('🚫 Blocking all threats...');
        const trafficLog = document.getElementById('trafficLog');
        if (!trafficLog) return;
        
        trafficLog.innerHTML += '\n<span style="color:#ff0055;">[ACTION] Blocking all threat sources...</span>';
        
        setTimeout(() => {
            threatCounter = 0;
            const threatCountElement = document.getElementById('threatCount');
            if (threatCountElement) {
                threatCountElement.textContent = '0';
            }
            trafficLog.innerHTML += '\n<span style="color:#00ff88;">[SUCCESS] All threats blocked successfully</span>';
            
            const alertsContainer = document.getElementById('recentAlerts');
            if (alertsContainer) {
                alertsContainer.innerHTML = '<div class="alert-item">All threats neutralized</div>';
            }
            
            // Reset all network nodes to normal state
            networkNodes.forEach(node => {
                const element = node.element;
                const data = node.data;
                element.style.backgroundColor = data.color;
                element.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.6)';
                element.style.animation = '';
            });
        }, 1500);
    }
    
    function addAlert(message) {
        const alertsContainer = document.getElementById('recentAlerts');
        if (!alertsContainer) return;
        
        if (alertsContainer.children.length === 1 && 
            alertsContainer.firstChild.textContent === "No alerts yet") {
            alertsContainer.innerHTML = '';
        }
        
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `<strong>ALERT:</strong> ${message}`;
        
        alertsContainer.insertBefore(alertItem, alertsContainer.firstChild);
        
        if (alertsContainer.children.length > 10) {
            alertsContainer.removeChild(alertsContainer.lastChild);
        }
    }
    
    // REAL-TIME IDS FUNCTIONS
    function startRealtimeIDS() {
        console.log('🛡️ Starting real-time IDS...');
        const realtimeLog = document.getElementById('realtimeTrafficLog');
        if (!realtimeLog) {
            console.error('❌ realtimeTrafficLog element not found');
            return;
        }
        
        realtimeLog.innerHTML = '> Starting real-time IDS monitoring...\n> Connecting to Suricata...\n> Activating threat detection...\n';
        
        idsActive = true;
        const statusElement = document.getElementById('realtimeStatus');
        if (statusElement) {
            statusElement.textContent = 'Active';
        }
        
        console.log('📡 Emitting start_ids event to server...');
        socket.emit('start_ids');
    }
    
    function stopRealtimeIDS() {
        console.log('⏹️ Stopping real-time IDS...');
        const realtimeLog = document.getElementById('realtimeTrafficLog');
        if (realtimeLog) {
            realtimeLog.innerHTML += '\n<span style="color:#ffaa00;">[SYSTEM] Real-time IDS stopped</span>';
        }
        
        idsActive = false;
        const statusElement = document.getElementById('realtimeStatus');
        if (statusElement) {
            statusElement.textContent = 'Inactive';
        }
        
        console.log('📡 Emitting stop_ids event to server...');
        socket.emit('stop_ids');
    }
    
    function clearRealtimeAlerts() {
        console.log('🗑️ Clearing real-time alerts...');
        const alertsContainer = document.getElementById('realtimeAlerts');
        if (alertsContainer) {
            alertsContainer.innerHTML = '<div class="realtime-alert-item">All alerts cleared</div>';
        }
        
        realtimeThreatCounter = 0;
        realtimeEventCounter = 0;
        
        const threatCountElement = document.getElementById('realtimeThreatCount');
        const eventCountElement = document.getElementById('realtimeEventCount');
        
        if (threatCountElement) threatCountElement.textContent = '0';
        if (eventCountElement) eventCountElement.textContent = '0';
    }
    
    function addRealtimeAlert(message, level, type) {
        console.log(`📥 Adding real-time alert: [${level}] ${message}`);
        
        const alertsContainer = document.getElementById('realtimeAlerts');
        if (!alertsContainer) {
            console.error('❌ realtimeAlerts container not found');
            return;
        }
        
        if (alertsContainer.children.length === 1 && 
            (alertsContainer.firstChild.textContent === "No live alerts yet" || 
             alertsContainer.firstChild.textContent === "All alerts cleared")) {
            alertsContainer.innerHTML = '';
        }
        
        const alertItem = document.createElement('div');
        alertItem.className = 'realtime-alert-item';
        
        let levelColor = '#00ff88';
        if (level === 'critical') levelColor = '#ff0055';
        else if (level === 'high') levelColor = '#ff9800';
        else if (level === 'medium') levelColor = '#ffeb3b';
        
        alertItem.innerHTML = `<span style="color:${levelColor}; font-weight:bold;">[${type.toUpperCase()}]</span> ${message}`;
        
        alertsContainer.insertBefore(alertItem, alertsContainer.firstChild);
        
        if (alertsContainer.children.length > 10) {
            alertsContainer.removeChild(alertsContainer.lastChild);
        }
        
        realtimeEventCounter++;
        const eventCountElement = document.getElementById('realtimeEventCount');
        if (eventCountElement) {
            eventCountElement.textContent = realtimeEventCounter;
        }
        
        if (level === 'critical' || level === 'high') {
            realtimeThreatCounter++;
            const threatCountElement = document.getElementById('realtimeThreatCount');
            if (threatCountElement) {
                threatCountElement.textContent = realtimeThreatCounter;
            }
        }
    }
    
    // SOCKET.IO EVENT HANDLERS - CRITICAL SECTION
    socket.on('connect', function() {
        console.log('✅ Connected to IDS server');
        const realtimeLog = document.getElementById('realtimeTrafficLog');
        if (realtimeLog) {
            realtimeLog.innerHTML += '\n<span style="color:#00b8ff;">[SYSTEM] ✅ Connected to real-time IDS server</span>';
            realtimeLog.innerHTML += '\n<span style="color:#00ff88;">[SYSTEM] 🛡️ Background threat monitoring active</span>';
            realtimeLog.scrollTop = realtimeLog.scrollHeight;
        }
        const statusElement = document.getElementById('realtimeStatus');
        if (statusElement) {
            statusElement.textContent = 'Connected';
        }
    });

    socket.on('ids_alert', function(data) {
        console.log('🛡️ RECEIVED IDS ALERT:', data);
        
        const realtimeLog = document.getElementById('realtimeTrafficLog');
        if (realtimeLog) {
            const logColor = data.level === 'critical' ? '#ff0055' : 
                           data.level === 'high' ? '#ff9800' : 
                           data.level === 'medium' ? '#ffeb3b' : '#00b8ff';
            
            const timestamp = data.timestamp || new Date().toLocaleTimeString();
            realtimeLog.innerHTML += `\n<span style="color:${logColor}; font-weight:bold;">[${timestamp}] [${data.type.toUpperCase()}] ${data.message}</span>`;
            realtimeLog.scrollTop = realtimeLog.scrollHeight;
        }
        
        addRealtimeAlert(data.message, data.level, data.type);
    });

    socket.on('disconnect', function() {
        console.log('❌ Disconnected from IDS server');
        const realtimeLog = document.getElementById('realtimeTrafficLog');
        if (realtimeLog) {
            realtimeLog.innerHTML += '\n<span style="color:#ff0055;">[SYSTEM] ❌ Disconnected from IDS server</span>';
            realtimeLog.scrollTop = realtimeLog.scrollHeight;
        }
        const statusElement = document.getElementById('realtimeStatus');
        if (statusElement) {
            statusElement.textContent = 'Disconnected';
        }
    });
    
    socket.on('connect_error', function(error) {
        console.error('❌ Socket.IO connection error:', error);
        const realtimeLog = document.getElementById('realtimeTrafficLog');
        if (realtimeLog) {
            realtimeLog.innerHTML += '\n<span style="color:#ff0055;">[ERROR] Connection failed - check server</span>';
            realtimeLog.scrollTop = realtimeLog.scrollHeight;
        }
    });
    
    socket.on('reconnect', function(attemptNumber) {
        console.log('🔄 Reconnected to server after', attemptNumber, 'attempts');
        const realtimeLog = document.getElementById('realtimeTrafficLog');
        if (realtimeLog) {
            realtimeLog.innerHTML += '\n<span style="color:#00ff88;">[SYSTEM] 🔄 Reconnected to IDS server</span>';
            realtimeLog.scrollTop = realtimeLog.scrollHeight;
        }
    });
    
    console.log('✅ IDS Panel initialized successfully!');
    console.log('🔍 Real-time alerts should start appearing automatically...');
});
