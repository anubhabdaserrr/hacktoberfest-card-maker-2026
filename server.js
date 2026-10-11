// server.js  (run with: node server.js)
const http = require("http");
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "index.html");
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  // Serve the card maker page
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    return fs.readFile(FILE, (err, data) => {
      if (err) { res.writeHead(500); return res.end("Couldn't read the HTML file"); }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  }

  // Optional: forward Ollama cloud requests so the browser never talks to ollama.com directly
  if (req.method === "POST" && req.url === "/ollama-cloud/api/chat") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", async () => {
      try {
        const r = await fetch("https://ollama.com/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization || ""
          },
          body: Buffer.concat(chunks)
        });
        res.writeHead(r.status, { "Content-Type": "application/json" });
        res.end(await r.text());
      } catch (e) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end("{}");
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
}).listen(PORT, () => console.log(`Card maker running at http://localhost:${PORT}`));