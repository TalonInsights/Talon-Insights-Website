"""Dev server matching vercel.json's cleanUrls: /pricing -> pricing.html."""
import http.server, functools, os
class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        p = self.path.split("?")[0]
        if p != "/" and "." not in os.path.basename(p):
            cand = p.strip("/") + ".html"
            if os.path.exists(os.path.join(os.getcwd(), cand)):
                self.path = "/" + cand
        return super().send_head()
http.server.ThreadingHTTPServer(("127.0.0.1", 4173), H).serve_forever()
