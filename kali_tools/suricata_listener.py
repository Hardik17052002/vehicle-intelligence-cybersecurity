import subprocess
import json
import time
from datetime import datetime
import re


# Network interface
INTERFACE = 'eth0'  # Change to your actual interface


def suricata_listener(socketio_instance):
    """
    Real-time Suricata IDS listener that monitors network traffic
    """
    def emit_ids_alert(message, level='info', alert_type='general'):
        print(f"[suricata_listener] Emitting IDS alert: {message[:100]}...")
        try:
            socketio_instance.emit('ids_alert', {
                'message': message,
                'level': level,
                'type': alert_type,
                'timestamp': datetime.now().strftime("%H:%M:%S")
            })
            socketio_instance.sleep(0)  # Yield to eventlet
            print("✓ IDS alert emitted successfully")
        except Exception as e:
            print(f"✗ IDS alert emit error: {e}")
    
    print(f"🛡️ Starting Suricata IDS listener on interface: {INTERFACE}")
    
    # Initial status message
    emit_ids_alert(f"Suricata IDS started on {INTERFACE}", 'info', 'system')
    
    # Suricata command for real-time monitoring
    cmd = [
        'sudo', 'suricata',
        '-i', INTERFACE,
        '--runmode', 'autofp',
        '-c', '/etc/suricata/suricata.yaml',
        '-l', '/tmp/suricata_logs/',
        '-v'
    ]
    
    try:
        emit_ids_alert(f"Starting Suricata with command: {' '.join(cmd[1:])}", 'info', 'system')
        
        # Start Suricata process
        with subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, 
                             text=True, bufsize=1) as proc:
            emit_ids_alert("✓ Suricata process started successfully", 'info', 'system')
            
            # Monitor stderr for alerts and status messages
            for line in proc.stderr:
                line = line.strip()
                if line:
                    # Parse Suricata output for different types of events
                    if parse_suricata_output(line, emit_ids_alert):
                        continue
                    
                    # General log output
                    if any(keyword in line.lower() for keyword in ['notice', 'warning', 'error', 'alert']):
                        level = determine_alert_level(line)
                        emit_ids_alert(f"Suricata: {line}", level, 'system')
            
            # Check process completion
            return_code = proc.wait()
            if return_code == 0:
                emit_ids_alert("✅ Suricata monitoring completed successfully", 'info', 'system')
            else:
                emit_ids_alert(f"⚠️ Suricata completed with code: {return_code}", 'medium', 'system')
                
    except FileNotFoundError:
        emit_ids_alert("❌ Suricata not found. Please install Suricata", 'critical', 'error')
    except PermissionError:
        emit_ids_alert("❌ Permission denied. Run with sudo privileges", 'critical', 'error')
    except Exception as e:
        emit_ids_alert(f"❌ Suricata error: {str(e)}", 'critical', 'error')


def parse_suricata_output(line, emit_func):
    """Parse Suricata output for specific alert patterns"""
    
    # Pattern matching for common threats
    threat_patterns = {
        'port scan': {'pattern': r'port.*scan', 'level': 'high', 'type': 'scan'},
        'brute force': {'pattern': r'brute.*force|failed.*login', 'level': 'critical', 'type': 'bruteforce'},
        'malware': {'pattern': r'malware|trojan|virus', 'level': 'critical', 'type': 'malware'},
        'suspicious': {'pattern': r'suspicious|anomal', 'level': 'medium', 'type': 'anomaly'},
        'exploit': {'pattern': r'exploit|attack', 'level': 'critical', 'type': 'exploit'},
        'dos': {'pattern': r'dos|ddos|flood', 'level': 'high', 'type': 'dos'}
    }
    
    for threat_name, threat_info in threat_patterns.items():
        if re.search(threat_info['pattern'], line, re.IGNORECASE):
            emit_func(f"🚨 {threat_name.upper()} detected: {line}", 
                     threat_info['level'], threat_info['type'])
            return True
    
    return False


def determine_alert_level(line):
    """Determine alert level based on line content"""
    line_lower = line.lower()
    
    if any(word in line_lower for word in ['critical', 'error', 'fail', 'attack']):
        return 'critical'
    elif any(word in line_lower for word in ['warning', 'warn', 'suspicious']):
        return 'high' 
    elif any(word in line_lower for word in ['notice', 'info']):
        return 'info'
    else:
        return 'medium'


def simulate_ids_alerts(socketio_instance):
    """
    Fallback function to simulate IDS alerts when Suricata isn't available
    """
    def emit_ids_alert(message, level='info', alert_type='general'):
        socketio_instance.emit('ids_alert', {
            'message': message,
            'level': level,
            'type': alert_type,
            'timestamp': datetime.now().strftime("%H:%M:%S")
        })
        socketio_instance.sleep(0)
    
    simulated_alerts = [
        ("Port scan detected from 192.168.1.100", 'high', 'scan'),
        ("Brute force attempt on SSH port 22", 'critical', 'bruteforce'),
        ("Suspicious HTTP traffic detected", 'medium', 'anomaly'),
        ("Malware signature detected in traffic", 'critical', 'malware'),
        ("DDoS attack pattern identified", 'high', 'dos'),
        ("SQL injection attempt blocked", 'high', 'exploit')
    ]
    
    print("🔄 Running simulated IDS alerts...")
    emit_ids_alert("Simulated IDS monitoring started", 'info', 'system')
    
    while True:
        import random
        alert = random.choice(simulated_alerts)
        emit_ids_alert(f"🚨 {alert[0]}", alert[1], alert[2])
        socketio_instance.sleep(random.randint(8, 20))
