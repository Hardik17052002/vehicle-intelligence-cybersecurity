document.addEventListener('DOMContentLoaded', function() {
    // Initialize SocketIO connection (SINGLE INSTANCE)
    const socket = io();
    
    // Navigation (existing code unchanged)
    const navItems = document.querySelectorAll('.nav-menu li');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            contentSections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Button Event Listeners (existing code unchanged)
    if (document.getElementById('toggle-can')) {
        document.getElementById('toggle-can').addEventListener('click', function() {
            socket.emit('toggle_can_monitoring');
        });
    }

    if (document.getElementById('run-scan')) {
        document.getElementById('run-scan').addEventListener('click', function() {
            this.disabled = true;
            socket.emit('start_scan', {scan_type: 'quick'});
        });
    }

    if (document.getElementById('run-pentest')) {
        document.getElementById('run-pentest').addEventListener('click', function() {
            this.disabled = true;
            socket.emit('start_pentest', {profile: 'basic'});
        });
    }

    if (document.getElementById('toggle-ids')) {
        document.getElementById('toggle-ids').addEventListener('click', function() {
            socket.emit('toggle_ids');
        });
    }

    // SocketIO Event Handlers (existing code unchanged)
    socket.on('can_status', (data) => {
        const statusText = data.status === 'active' ? 'Active' : 'Inactive';
        if (document.getElementById('can-status')) {
            document.getElementById('can-status').textContent = statusText;
            document.getElementById('toggle-can').textContent = 
                data.status === 'active' ? 'Stop Monitoring' : 'Start Monitoring';
            document.getElementById('can-bus-status').className = 
                `status-indicator ${data.status === 'active' ? 'active' : ''}`;
        }
        addSecurityEvent(`CAN Monitoring ${statusText}`, 'info');
    });

    socket.on('can_message', () => {
        const countElement = document.getElementById('can-message-count');
        if (countElement) {
            countElement.textContent = parseInt(countElement.textContent) + 1;
        }
    });

    socket.on('scan_update', (data) => {
        if (data.progress && document.getElementById('scan-progress')) {
            document.getElementById('scan-progress').style.width = `${data.progress}%`;
            document.getElementById('scan-status').textContent = `Scanning (${data.progress}%)`;
        }
        if (data.finding) {
            addSecurityEvent(`Scan: ${data.finding}`, data.severity);
        }
    });

    socket.on('scan_complete', (data) => {
        if (document.getElementById('scan-progress')) {
            document.getElementById('scan-progress').style.width = '0%';
            document.getElementById('last-scan').textContent = data.last_scan;
            document.getElementById('vuln-count').textContent = data.findings;
            document.getElementById('run-scan').disabled = false;
        }
        addSecurityEvent('Vulnerability scan completed', 'info');
    });

    socket.on('pentest_update', (data) => {
        if (data.progress && document.getElementById('pentest-progress')) {
            document.getElementById('pentest-progress').style.width = `${data.progress}%`;
            document.getElementById('pentest-status').textContent = `Testing (${data.progress}%)`;
        }
        if (data.finding) {
            addSecurityEvent(`Pentest: ${data.finding}`, data.severity);
        }
    });

    socket.on('pentest_complete', () => {
        if (document.getElementById('pentest-progress')) {
            document.getElementById('pentest-progress').style.width = '0%';
            document.getElementById('pentest-status').textContent = 'Ready';
            document.getElementById('run-pentest').disabled = false;
        }
        addSecurityEvent('Penetration test completed', 'info');
    });

    // NEW: Real-time pentest output handler
    socket.on('pentest_output', function(data) {
        console.log('🎯 RECEIVED PENTEST OUTPUT:', data);
        const outputDiv = document.getElementById('realtime-pentest-output');
        
        if (outputDiv) {
            // Remove placeholder message on first event
            const placeholder = outputDiv.querySelector('p[style*="opacity"]');
            if (placeholder && placeholder.textContent.includes('Connecting')) {
                outputDiv.innerHTML = '';
            }

            const msg = `[${data.timestamp}] ${data.message}`;
            const eventDiv = document.createElement('div');
            eventDiv.className = `realtime-event ${data.level}`;
            eventDiv.textContent = msg;

            outputDiv.appendChild(eventDiv);

            // Keep only the last 100 messages for performance
            while (outputDiv.children.length > 100) {
                outputDiv.removeChild(outputDiv.firstChild);
            }

            // Auto-scroll to bottom
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }
    });

    // NEW: Pentest started handler
    socket.on('pentest_started', function(data) {
        console.log('🚀 Pentest started:', data);
        const outputDiv = document.getElementById('realtime-pentest-output');
        if (outputDiv) {
            outputDiv.innerHTML = `<p style="color: #00ff88;">🚀 Pentest started against ${data.target} (${data.scan_type})</p>`;
        }
        addSecurityEvent(`Real-time pentest started: ${data.target} (${data.scan_type})`, 'info');
    });

    socket.on('ids_status', (data) => {
        const statusText = data.status === 'active' ? 'Active' : 'Inactive';
        if (document.getElementById('ids-status')) {
            document.getElementById('ids-status').textContent = statusText;
            document.getElementById('toggle-ids').textContent = 
                data.status === 'active' ? 'Stop IDS' : 'Start IDS';
            document.getElementById('ids-status-indicator').className = 
                `status-indicator ${data.status === 'active' ? 'active' : ''}`;
        }
        addSecurityEvent(`IDS ${statusText}`, 'info');
    });

    socket.on('ids_alert', (data) => {
        if (document.getElementById('ids-alerts')) {
            document.getElementById('ids-alerts').textContent = 
                parseInt(document.getElementById('ids-alerts').textContent) + 1;
        }
        addSecurityEvent(`IDS Alert: ${data.message}`, data.severity);
    });

    // NEW: Real-Time Threat Detection Handler
    socket.on('realtime_threat', function(data) {
        console.log('🎯 RECEIVED THREAT EVENT:', data);
        const realtimeEventsDiv = document.getElementById('realtime-events');
        
        if (realtimeEventsDiv) {
            // Remove placeholder connection message on first event
            const placeholder = realtimeEventsDiv.querySelector('p[style*="opacity"]');
            if (placeholder && placeholder.textContent.includes('Connecting')) {
                realtimeEventsDiv.innerHTML = '';
            }

            const msg = `[${data.timestamp}] [${data.level.toUpperCase()}] ${data.message}`;
            const eventDiv = document.createElement('div');
            eventDiv.className = `realtime-event ${data.level}`;
            eventDiv.textContent = msg;

            realtimeEventsDiv.insertBefore(eventDiv, realtimeEventsDiv.firstChild);

            // Keep only the last 50 messages for performance
            while (realtimeEventsDiv.children.length > 50) {
                realtimeEventsDiv.removeChild(realtimeEventsDiv.lastChild);
            }
        }
    });

    // Helper function to add security events (existing code unchanged)
    function addSecurityEvent(message, severity) {
        const eventsList = document.getElementById('events-list');
        if (eventsList) {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';
            eventDiv.innerHTML = `
                <div>
                    <span class="event-severity ${severity}">${severity.toUpperCase()}</span>
                    <span>${message}</span>
                </div>
                <span>${new Date().toLocaleTimeString()}</span>
            `;
            
            if (eventsList.children.length > 0) {
                eventsList.insertBefore(eventDiv, eventsList.firstChild);
            } else {
                eventsList.appendChild(eventDiv);
            }
            
            if (eventsList.children.length > 10) {
                eventsList.removeChild(eventsList.lastChild);
            }
        }
    }

    // Connection status (existing code unchanged)
    socket.on('connect', () => {
        console.log('✅ Connected to server');
        addSecurityEvent('Connected to server', 'info');
        
        // Update real-time panel connection status
        const realtimeEventsDiv = document.getElementById('realtime-events');
        if (realtimeEventsDiv && realtimeEventsDiv.textContent.includes('Connecting')) {
            realtimeEventsDiv.innerHTML = '<p style="color: #00b8ff;">✓ Connected - Live monitoring active</p>';
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        addSecurityEvent('Disconnected from server', 'warning');
        
        // Update real-time panel disconnection status
        const realtimeEventsDiv = document.getElementById('realtime-events');
        if (realtimeEventsDiv) {
            realtimeEventsDiv.innerHTML = '<p style="color: #ff0055;">✗ Disconnected - Attempting to reconnect...</p>';
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        addSecurityEvent('Connection error', 'critical');
    });
});
