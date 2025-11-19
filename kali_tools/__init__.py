"""
Kali Linux Tools Integration Package

This package contains real-time integrations with various Kali Linux security tools
for the cybersecurity dashboard.
"""

from .tshark_streamer import tshark_listener
from .pentest_listener import pentest_listener

__all__ = ['tshark_listener', 'pentest_listener']
