#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://127.0.0.1:4173/#/about}"
OUT="${2:-visual-check.png}"

node --input-type=module - "$URL" "$OUT" <<'NODE'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import pkg from '/home/ubuntu/.npm-global/lib/node_modules/playwright/index.js'

const url = process.argv[2]
const out = process.argv[3]
const { chromium } = pkg
const root = path.resolve('docs')

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0])
  let filePath = path.join(root, urlPath === '/' ? '/index.html' : urlPath)
  if (!filePath.startsWith(root)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(root, 'index.html')
  const ext = path.extname(filePath)
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' }
  res.setHeader('Content-Type', types[ext] || 'text/plain')
  fs.createReadStream(filePath).pipe(res)
})

server.listen(4173, '127.0.0.1', async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/home/ubuntu/.local/bin/chromium-browser' })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.screenshot({ path: out, fullPage: true })
  await browser.close()
  server.close()
})
NODE
