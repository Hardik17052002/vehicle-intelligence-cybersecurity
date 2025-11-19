import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
from datetime import datetime
from kali_tools.tshark_streamer import tshark_listener
from kali_tools.pentest_listener import pentest_listener
from kali_tools.suricata_listener import suricata_listener, simulate_ids_alerts

app = Flask(__name__)
socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins="*")

# Threat database for simulated fallback events
THREATS = [
    "Brute force attempt detected on SSH",
    "Malicious payload detected in HTTP traffic",
    "Suspicious port scanning activity",
    "Possible ransomware signature detected",
    "Dark web IOC match found",
    "Unauthorized database access attempt",
    "Zero-day exploit attempt detected"
]

# Global thread flags - CRITICAL FIX
sim_thread_started = False
tshark_thread_started = False
suricata_thread_started = False
ids_simulator_started = False

def threat_generator():
    while True:
        threat = random.choice(THREATS)
        level = random.choice(['critical', 'high', 'info'])
        stats = {
            'threats': random.randint(100, 500),
            'rate': random.randint(1, 20),
            'safety': random.randint(85, 100)
        }
        socketio.emit('realtime_threat', {
            'message': threat,
            'level': level,
            'stats': stats,
            'timestamp': datetime.now().strftime("%H:%M:%S")
        })
        socketio.sleep(random.randint(5, 15))

def ids_threat_simulator():
    """IDS-specific threat simulator - ALWAYS RUNNING"""
    ids_threats = [
        "Malware signature detected in network traffic",
        "Suspicious DNS query to known C&C server",
        "Unusual outbound connection pattern detected",
        "Potential data exfiltration attempt blocked",
        "Port scan activity detected from external source",
        "SQL injection attempt blocked by WAF",
        "Cross-site scripting (XSS) payload detected",
        "Brute force login attempt detected",
        "Suspicious file upload attempt blocked",
        "Command injection attempt prevented"
    ]
    
    print("🛡️ IDS simulator thread started - emitting alerts every 3-12 seconds")
    
    while True:
        threat = random.choice(ids_threats)
        level = random.choice(['critical', 'high', 'medium', 'info'])
        threat_type = random.choice(['malware', 'intrusion', 'scan', 'exploit', 'injection'])
        
        socketio.emit('ids_alert', {
            'message': threat,
            'level': level,
            'type': threat_type,
            'timestamp': datetime.now().strftime("%H:%M:%S")
        })
        
        print(f"🚨 IDS Alert Emitted: [{level.upper()}] {threat}")
        socketio.sleep(random.randint(3, 12))

@app.route('/')
def dashboard():
    return render_template('index.html')

@app.route('/<module>')
def load_module(module):
    if module.endswith('.html'):
        module = module[:-5]
    return render_template(f'{module}.html')

# Test routes
@app.route('/emit_test')
def emit_test():
    socketio.emit('realtime_threat', {
        'message': 'Manual test event from server',
        'level': 'info',
        'timestamp': datetime.now().strftime("%H:%M:%S")
    })
    return 'Test event emitted!'

@app.route('/pentest_emit_test')
def pentest_emit_test():
    socketio.emit('pentest_output', {
        'message': 'Manual pentest test event from server',
        'level': 'info',
        'timestamp': datetime.now().strftime("%H:%M:%S")
    })
    return 'Pentest test event emitted!'

@app.route('/ids_emit_test')
def ids_emit_test():
    socketio.emit('ids_alert', {
        'message': 'Manual IDS test alert from server - DIRECT EMIT TEST',
        'level': 'high',
        'type': 'test',
        'timestamp': datetime.now().strftime("%H:%M:%S")
    })
    print("🧪 Manual IDS test alert emitted via /ids_emit_test")
    return 'IDS test alert emitted! Check your dashboard.'

@socketio.on('connect')
def handle_connect():
    global sim_thread_started, tshark_thread_started, suricata_thread_started, ids_simulator_started
    print(f'🔗 Client connected: {request.sid}')
    
    # Start the simulated threat generator for AI threat scanner
    if not sim_thread_started:
        print('🚀 Starting simulated threat generator...')
        try:
            socketio.start_background_task(threat_generator)
            sim_thread_started = True
            print('✅ Threat generator started successfully')
        except Exception as e:
            print(f'❌ Error starting threat generator: {e}')
    
    # Start Tshark listener
    if not tshark_thread_started:
        print('🚀 Starting Tshark background task...')
        try:
            socketio.start_background_task(tshark_listener, socketio)
            tshark_thread_started = True
            print('✅ Tshark task started successfully')
        except Exception as e:
            print(f'❌ Error starting Tshark task: {e}')
    
    # Start Suricata IDS listener OR fallback to simulator
    if not suricata_thread_started:
        print('🛡️ Starting Suricata IDS background task...')
        try:
            # Try real Suricata first
            socketio.start_background_task(suricata_listener, socketio)
            suricata_thread_started = True
            print('✅ Real Suricata IDS task started successfully')
        except Exception as e:
            print(f'❌ Error starting real Suricata: {e}')
            suricata_thread_started = True  # Mark as started to prevent retry
    

    
    # Send immediate connection confirmation to IDS panel
    socketio.emit('ids_alert', {
        'message': 'IDS system connected and monitoring started',
        'level': 'info',
        'type': 'system',
        'timestamp': datetime.now().strftime("%H:%M:%S")
    }, room=request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    print(f'🔌 Client disconnected: {request.sid}')

# Socket.IO event handlers
@socketio.on('toggle_can_monitoring')
def handle_toggle_can():
    pass

@socketio.on('start_scan')
def handle_start_scan(data):
    pass

@socketio.on('start_pentest')
def handle_start_pentest(data):
    sid = request.sid
    target = data.get('target', '127.0.0.1')
    scan_type = data.get('scan_type', 'network')

    print(f'⏩ Received start_pentest from SID: {sid} target={target} scan_type={scan_type}')
    
    try:
        socketio.start_background_task(pentest_listener, target, scan_type, sid, socketio)
        socketio.emit('pentest_started', {
            'target': target,
            'scan_type': scan_type,
            'timestamp': datetime.now().strftime("%H:%M:%S")
        }, room=sid)
        print("✅ Pentest listener task started successfully")
    except Exception as e:
        print(f'❌ Error starting pentest: {e}')
        socketio.emit('pentest_output', {
            'message': f'Error starting pentest: {str(e)}',
            'level': 'critical',
            'timestamp': datetime.now().strftime("%H:%M:%S")
        }, room=sid)

@socketio.on('stop_pentest')
def handle_stop_pentest():
    sid = request.sid
    print(f'🛑 Stop pentest requested from SID: {sid}')
    socketio.emit('pentest_output', {
        'message': 'Pentest scan stopped by user',
        'level': 'info',
        'timestamp': datetime.now().strftime("%H:%M:%S")
    }, room=sid)

# IDS event handlers
@socketio.on('toggle_ids')
def handle_toggle_ids():
    sid = request.sid
    print(f'🛡️ IDS toggle requested from SID: {sid}')
    
    socketio.emit('ids_alert', {
        'message': 'IDS monitoring toggled by user',
        'level': 'info',
        'type': 'system',
        'timestamp': datetime.now().strftime("%H:%M:%S")
    }, room=sid)

@socketio.on('start_ids')
def handle_start_ids():
    sid = request.sid
    print(f'🛡️ Start IDS requested from SID: {sid}')
    
    socketio.emit('ids_alert', {
        'message': 'IDS real-time monitoring activated by user',
        'level': 'info',
        'type': 'system',
        'timestamp': datetime.now().strftime("%H:%M:%S")
    }, room=sid)

@socketio.on('stop_ids')
def handle_stop_ids():
    sid = request.sid
    print(f'🛡️ Stop IDS requested from SID: {sid}')
    
    socketio.emit('ids_alert', {
        'message': 'IDS monitoring deactivated by user',
        'level': 'info',
        'type': 'system',
        'timestamp': datetime.now().strftime("%H:%M:%S")
    }, room=sid)

@app.route('/test_background_emit')
def test_background_emit():
    def simple_background_task():
        for i in range(5):
            print(f"Background task: emitting message {i+1}")
            socketio.emit('pentest_output', {
                'message': f'Background test message {i+1}',
                'level': 'info',
                'timestamp': datetime.now().strftime("%H:%M:%S")
            }, broadcast=True)
            socketio.sleep(2)
        print("Background task completed")
    
    socketio.start_background_task(simple_background_task)
    return 'Background emit test started - check your dashboard!'

if __name__ == '__main__':
    print("🚀 Starting Flask-SocketIO server...")
    print("📍 Access your Index panel at: http://localhost:5000")
    print("📍 Access your IDS panel at: http://localhost:5000/ids")
    print("🧪 Test IDS alerts at: http://localhost:5000/ids_emit_test")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
