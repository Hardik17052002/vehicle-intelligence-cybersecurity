import subprocess
from datetime import datetime
import re

# Set your network interface here - CHECK WITH: ip a
INTERFACE = 'eth0'  # Change to your actual interface (e.g., wlan0, ens33)

# Suspicious patterns - matches real network threats
SUSPICIOUS_PATTERNS = [
    re.compile(r'icmp', re.I),           # ICMP traffic
    re.compile(r'bootp', re.I),          # DHCP/BOOTP
    re.compile(r'tcp.*23', re.I),        # Telnet traffic
    re.compile(r'tcp.*21', re.I),        # FTP traffic  
    re.compile(r'tcp.*135', re.I),       # RPC traffic
    re.compile(r'tcp.*139', re.I),       # NetBIOS traffic
    re.compile(r'tcp.*445', re.I),       # SMB traffic
    re.compile(r'arp', re.I),            # ARP traffic
    re.compile(r'dns', re.I),            # DNS queries
    re.compile(r'http', re.I),           # HTTP traffic
]

def is_suspicious(packet_line):
    return any(p.search(packet_line) for p in SUSPICIOUS_PATTERNS)

def tshark_listener(socketio_instance):
    # Import socketio here to avoid circular import
    
    
    def emit_threat(message, level='high'):
        print(f"EMIT: {message[:100]}...")  # Debug print (truncated)
        try:
            socketio_instance.emit('realtime_threat', {
                'message': message,
                'level': level,
                'timestamp': datetime.now().strftime("%H:%M:%S")
            })
            socketio_instance.sleep(0)  # Yield to eventlet
        except Exception as e:
            print(f"Emit error: {e}")

    print(f"🔍 Starting Tshark listener on interface: {INTERFACE}")
    
    # Test emit first
    emit_threat("Tshark real-time monitoring started", 'info')
    
    # Tshark command for live packet capture
    cmd = [
        'tshark',
        '-i', INTERFACE,
        '-T', 'fields',
        '-e', 'frame.number',
        '-e', 'frame.time_relative', 
        '-e', 'ip.src',
        '-e', 'ip.dst',
        '-e', 'frame.protocols',
        '-e', '_ws.col.Info',
        '-n',  # Don't resolve names
        '-l'   # Line buffered output
    ]

    try:
        with subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, 
                            text=True, bufsize=1) as proc:
            print("✓ Tshark process started successfully")
            
            for line in proc.stdout:
                line = line.strip()
                if line:  # Skip empty lines
                    print(f"📦 Packet: {line[:80]}...")  # Debug print (truncated)
                    
                    if is_suspicious(line):
                        # Determine threat level based on protocol
                        if any(p in line.lower() for p in ['telnet', 'ftp', 'rpc']):
                            level = 'critical'
                        elif any(p in line.lower() for p in ['smb', 'netbios']):
                            level = 'high'
                        else:
                            level = 'info'
                            
                        emit_threat(f"Network traffic detected: {line}", level)
                        
    except FileNotFoundError:
        print("ERROR: Tshark not found. Install with: sudo apt install tshark")
        emit_threat("Tshark not installed - install with: sudo apt install tshark", 'critical')
    except PermissionError:
        print("ERROR: Permission denied. Run Flask with sudo or add user to wireshark group")
        emit_threat("Permission denied for packet capture", 'critical')
    except Exception as e:
        print(f"Tshark error: {e}")
        emit_threat(f"Tshark error: {str(e)}", 'critical')
