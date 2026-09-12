from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os

PORT = 3000
DIRECTORY = r"d:\0000 Autonomo\Webs\gamepad-tester"

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status":"ok"}')
    
    def log_message(self, format, *args):
        pass

ThreadingHTTPServer.allow_reuse_address = True
with ThreadingHTTPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Server ready at http://localhost:{PORT}")
    httpd.serve_forever()
