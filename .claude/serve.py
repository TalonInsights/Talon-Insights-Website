"""Dev server matching vercel.json's cleanUrls: /pricing -> pricing.html.

It also refuses to let the browser cache anything. Without that, an edited
script or stylesheet keeps being served from memory cache while the file on
disk is already correct - which looks exactly like a change that did not
work, and sends you looking for a bug that is not there.
"""
import http.server, os


class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        p = self.path.split("?")[0]
        if p != "/" and "." not in os.path.basename(p):
            cand = p.strip("/") + ".html"
            if os.path.exists(os.path.join(os.getcwd(), cand)):
                self.path = "/" + cand
        return super().send_head()

    def send_response(self, code, message=None):
        # A 304 would defeat the point, so ask for a full body every time.
        super().send_response(200 if code == 304 else code, message)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


http.server.ThreadingHTTPServer(("127.0.0.1", 4173), H).serve_forever()
