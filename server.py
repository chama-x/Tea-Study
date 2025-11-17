#!/usr/bin/env python3
"""
Simple HTTP server for the Study Notes App
Run this file to start the server: python3 server.py
"""

import http.server
import socketserver
import webbrowser
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    Handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"✨ Study Notes App Server")
        print(f"📚 Server running at: http://localhost:{PORT}")
        print(f"🌐 Opening browser...")
        print(f"⌨️  Press Ctrl+C to stop the server\n")
        
        # Open browser automatically
        webbrowser.open(f'http://localhost:{PORT}')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped. Goodbye!")
