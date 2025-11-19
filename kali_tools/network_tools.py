import subprocess
import threading
import socket
import time
import re
from datetime import datetime
import eventlet


def ping_target(target, socketio_instance, sid):
    """Execute real-time ping command"""
    print(f"🏓 Starting ping to {target} for SID: {sid}")
    
    def emit_ping_result(message, level='info'):
        socketio_instance.emit('ping_result', {
            'message': message,
            'level': level,
            'timestamp': datetime.now().strftime("%H:%M:%S")
        }, room=sid)
        socketio_instance.sleep(0)
    
    # Validate target
    if not target or len(target.strip()) == 0:
        emit_ping_result("Error: Please enter a valid target", 'error')
        return
    
    target = target.strip()
    emit_ping_result(f"Starting ping to {target}...")
    
    try:
        # Use ping command (works on both Linux and Windows)
        cmd = ['ping', '-c', '4', target] if subprocess.os.name != 'nt' else ['ping', '-n', '4', target]
        
        with subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, 
                             text=True, bufsize=1) as proc:
            
            while True:
                output = proc.stdout.readline()
                if output == '' and proc.poll() is not None:
                    break
                if output:
                    line = output.strip()
                    if line:
                        emit_ping_result(line)
            
            # Get any remaining output
            remaining_output, error_output = proc.communicate()
            if remaining_output:
                for line in remaining_output.strip().split('\n'):
                    if line.strip():
                        emit_ping_result(line.strip())
            
            if error_output:
                emit_ping_result(f"Error: {error_output.strip()}", 'error')
            
            if proc.returncode == 0:
                emit_ping_result("✅ Ping completed successfully", 'success')
            else:
                emit_ping_result("⚠️ Ping completed with warnings", 'warning')
                
    except FileNotFoundError:
        emit_ping_result("❌ Ping command not found on system", 'error')
    except Exception as e:
        emit_ping_result(f"❌ Ping error: {str(e)}", 'error')


def traceroute_target(target, socketio_instance, sid):
    """Execute real-time traceroute command"""
    print(f"🛣️ Starting traceroute to {target} for SID: {sid}")
    
    def emit_trace_result(message, level='info'):
        socketio_instance.emit('traceroute_result', {
            'message': message,
            'level': level,
            'timestamp': datetime.now().strftime("%H:%M:%S")
        }, room=sid)
        socketio_instance.sleep(0)
    
    # Validate target
    if not target or len(target.strip()) == 0:
        emit_trace_result("Error: Please enter a valid target", 'error')
        return
    
    target = target.strip()
    emit_trace_result(f"Starting traceroute to {target}...")
    
    try:
        # Use traceroute (Linux) or tracert (Windows)
        if subprocess.os.name == 'nt':
            cmd = ['tracert', target]
        else:
            cmd = ['traceroute', target]
        
        with subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, 
                             text=True, bufsize=1) as proc:
            
            while True:
                output = proc.stdout.readline()
                if output == '' and proc.poll() is not None:
                    break
                if output:
                    line = output.strip()
                    if line:
                        emit_trace_result(line)
            
            # Get any remaining output
            remaining_output, error_output = proc.communicate()
            if remaining_output:
                for line in remaining_output.strip().split('\n'):
                    if line.strip():
                        emit_trace_result(line.strip())
            
            if error_output:
                emit_trace_result(f"Error: {error_output.strip()}", 'error')
            
            if proc.returncode == 0:
                emit_trace_result("✅ Traceroute completed successfully", 'success')
            else:
                emit_trace_result("⚠️ Traceroute completed with warnings", 'warning')
                
    except FileNotFoundError:
        emit_trace_result("❌ Traceroute command not found on system", 'error')
    except Exception as e:
        emit_trace_result(f"❌ Traceroute error: {str(e)}", 'error')


def port_scan_target(target, scan_speed, socketio_instance, sid):
    """Execute real-time port scanning"""
    print(f"🔍 Starting port scan of {target} ({scan_speed}) for SID: {sid}")
    
    def emit_scan_result(message, level='info'):
        socketio_instance.emit('portscan_result', {
            'message': message,
            'level': level,
            'timestamp': datetime.now().strftime("%H:%M:%S")
        }, room=sid)
        socketio_instance.sleep(0)
    
    # Validate target
    if not target or len(target.strip()) == 0:
        emit_scan_result("Error: Please enter a valid target", 'error')
        return
    
    target = target.strip()
    emit_scan_result(f"Starting {scan_speed} port scan of {target}...")
    
    # Define port ranges based on scan speed
    port_ranges = {
        'fast': [21, 22, 23, 25, 53, 80, 110, 443, 993, 995],
        'normal': list(range(1, 1001)),
        'deep': list(range(1, 65536))
    }
    
    ports_to_scan = port_ranges.get(scan_speed, port_ranges['fast'])
    open_ports = []
    timeout = 1 if scan_speed == 'fast' else 0.5 if scan_speed == 'normal' else 0.3
    
    try:
        # Resolve hostname to IP
        try:
            target_ip = socket.gethostbyname(target)
            if target != target_ip:
                emit_scan_result(f"Resolved {target} to {target_ip}")
        except socket.gaierror:
            emit_scan_result(f"❌ Unable to resolve hostname: {target}", 'error')
            return
        
        total_ports = len(ports_to_scan)
        scanned = 0
        
        for port in ports_to_scan:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(timeout)
                result = sock.connect_ex((target_ip, port))
                
                if result == 0:
                    service = get_service_name(port)
                    open_ports.append(port)
                    emit_scan_result(f"✅ Port {port} OPEN ({service})", 'success')
                
                sock.close()
                scanned += 1
                
                # Progress update every 50 ports or for fast scan
                if scanned % 50 == 0 or scan_speed == 'fast':
                    progress = int((scanned / total_ports) * 100)
                    emit_scan_result(f"Progress: {progress}% ({scanned}/{total_ports} ports)")
                
                # Small delay to prevent overwhelming
                eventlet.sleep(0.001)
                
            except Exception as e:
                continue
        
        # Final results
        emit_scan_result(f"✅ Scan completed! Found {len(open_ports)} open ports out of {total_ports} scanned", 'success')
        if open_ports:
            emit_scan_result(f"Open ports: {', '.join(map(str, open_ports))}", 'info')
        else:
            emit_scan_result("No open ports found", 'info')
            
    except Exception as e:
        emit_scan_result(f"❌ Port scan error: {str(e)}", 'error')


def get_service_name(port):
    """Get common service name for port"""
    services = {
        21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
        80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 993: 'IMAPS',
        995: 'POP3S', 3389: 'RDP', 3306: 'MySQL', 5432: 'PostgreSQL',
        1433: 'MSSQL', 27017: 'MongoDB', 6379: 'Redis', 5672: 'RabbitMQ'
    }
    return services.get(port, 'Unknown')


def nmap_port_scan(target, scan_speed, socketio_instance, sid):
    """Execute nmap port scan if available"""
    print(f"🔍 Starting nmap scan of {target} ({scan_speed}) for SID: {sid}")
    
    def emit_scan_result(message, level='info'):
        socketio_instance.emit('portscan_result', {
            'message': message,
            'level': level,
            'timestamp': datetime.now().strftime("%H:%M:%S")
        }, room=sid)
        socketio_instance.sleep(0)
    
    # Validate target
    if not target or len(target.strip()) == 0:
        emit_scan_result("Error: Please enter a valid target", 'error')
        return
    
    target = target.strip()
    emit_scan_result(f"Starting nmap {scan_speed} scan of {target}...")
    
    # Define nmap options based on scan speed
    speed_options = {
        'fast': ['-F'],  # Fast scan (top 100 ports)
        'normal': ['-sS'],  # SYN scan
        'deep': ['-sS', '-O']  # SYN scan with OS detection
    }
    
    try:
        cmd = ['nmap'] + speed_options.get(scan_speed, ['-F']) + [target]
        emit_scan_result(f"Running: {' '.join(cmd)}")
        
        with subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, 
                             text=True, bufsize=1) as proc:
            
            while True:
                output = proc.stdout.readline()
                if output == '' and proc.poll() is not None:
                    break
                if output:
                    line = output.strip()
                    if line and not line.startswith('Starting') and not line.startswith('Nmap'):
                        emit_scan_result(line)
            
            # Get any remaining output
            remaining_output, error_output = proc.communicate()
            if remaining_output:
                for line in remaining_output.strip().split('\n'):
                    if line.strip():
                        emit_scan_result(line.strip())
            
            if error_output:
                emit_scan_result(f"Error: {error_output.strip()}", 'error')
            
            if proc.returncode == 0:
                emit_scan_result("✅ Nmap scan completed successfully", 'success')
            else:
                emit_scan_result("⚠️ Nmap scan completed with warnings", 'warning')
                
    except FileNotFoundError:
        emit_scan_result("❌ Nmap not found, falling back to basic port scan", 'warning')
        # Fallback to basic port scan
        port_scan_target(target, scan_speed, socketio_instance, sid)
    except Exception as e:
        emit_scan_result(f"❌ Nmap error: {str(e)}", 'error')
