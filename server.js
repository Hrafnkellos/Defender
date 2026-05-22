"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
    ".html": "text/html",
    ".js":   "application/javascript",
    ".css":  "text/css",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".gif":  "image/gif",
    ".ogg":  "audio/ogg",
    ".mp3":  "audio/mpeg",
    ".wav":  "audio/wav",
};

const server = http.createServer((req, res) => {
    let urlPath = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(ROOT, urlPath);

    // Prevent directory traversal outside project root
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(`Not found: ${urlPath}`);
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Defender running at http://localhost:${PORT}`);
});
