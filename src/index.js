
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const { pathname, searchParams } = new URL(request.url)

  if (pathname === '/api') {
    return await handleApi(searchParams)
  } else {
    return new Response(renderPage(), {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' }
    })
  }
}

async function handleApi(searchParams) {
  const resi = searchParams.get('resi')
  const pin = searchParams.get('pin')

  if (!resi || !pin) {
    return new Response(JSON.stringify({ error: 'Nomor resi dan pin harus diisi.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const apiUrl = 'https://rest.idexpress.com/client/overt/track/attest/web/' + resi + ',' + pin

  try {
    const response = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const data = await response.json()

    if (data.code !== 0 || !data.data || data.data.length === 0) {
      return new Response(JSON.stringify({ error: 'Data tidak ditemukan.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Gagal mengambil data.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function renderPage() {
  return '<!DOCTYPE html>' +
  '<html lang="id">' +
  '<head>' +
  '<meta charset="UTF-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
  '<title>Cek Resi ID Express</title>' +
  '<style>' +
  'body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #74ebd5, #ACB6E5); }' +
  '.container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 600px; width: 100%; }' +
  'h1 { text-align: center; margin-bottom: 20px; }' +
  'input, button { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }' +
  'button { background: #007BFF; color: white; cursor: pointer; }' +
  'button:hover { background: #0056b3; }' +
  '.loading { text-align: center; margin-top: 20px; display: none; }' +
  '.result { margin-top: 20px; max-height: 500px; overflow-y: auto; word-wrap: break-word; white-space: pre-wrap; }' +
  'img { max-width: 100%; margin-top: 10px; border-radius: 10px; }' +
  '.log-item { background: #f9f9f9; padding: 10px; border-left: 4px solid #007BFF; margin-bottom: 10px; border-radius: 5px; }' +
  '.dark-mode { background: linear-gradient(135deg, #1c1c1c, #434343); color: white; }' +
  '.dark-mode .container { background: #333; color: white; }' +
  '</style>' +
  '</head>' +
  '<body>' +
  '<div class="container">' +
  '<h1>Cek Resi ID Express</h1>' +
  '<form id="form">' +
  '<input type="text" id="resi" placeholder="Nomor Resi" required>' +
  '<input type="text" id="pin" placeholder="PIN Resi" required>' +
  '<button type="submit">Lacak</button>' +
  '</form>' +
  '<div class="loading" id="loading">Loading...</div>' +
  '<button onclick="toggleDarkMode()">Mode Gelap</button>' +
  '<div class="result" id="result"></div>' +
  '</div>' +
  '<script>' +
  'function toggleDarkMode() { document.body.classList.toggle("dark-mode"); }' +
  'document.getElementById("form").addEventListener("submit", async function(e) {' +
  'e.preventDefault();' +
  'document.getElementById("loading").style.display = "block";' +
  'document.getElementById("result").innerHTML = "";' +
  'var resi = document.getElementById("resi").value.trim();' +
  'var pin = document.getElementById("pin").value.trim();' +
  'var response = await fetch("/api?resi=" + resi + "&pin=" + pin);' +
  'document.getElementById("loading").style.display = "none";' +
  'if (!response.ok) { document.getElementById("result").innerHTML = "<p style=\"color:red;\">Resi tidak ditemukan atau server error.</p>"; return; }' +
  'var data = await response.json();' +
  'var detail = data.data[0];' +
  'var logs = detail.scanLineVOS;' +
  'var html = "<h3>Pengirim: " + detail.senderName + " (" + detail.senderCityName + ")</h3>" +' +
  '"<h3>Penerima: " + detail.recipientName + " (" + detail.recipientCityName + ")</h3>" +' +
  '"<h4>Status: " + detail.waybillStatus + "</h4>";' +
  'if (detail.photoUrl) { html += "<img src='" + detail.photoUrl + "' alt='Bukti Pengiriman'>"; }' +
  'html += "<h3>Detail Lengkap:</h3><pre>" + JSON.stringify(detail, null, 2) + "</pre>";' +
  'html += "<h3>Log Perjalanan:</h3>";' +
  'logs.forEach(function(log) {' +
  'html += "<div class=\"log-item\"><strong>" + log.operationTime + "</strong><br>" +' +
  '(log.operationBranchName || "-") + " ke " + (log.nextBranchName || "-") + "<br>" +' +
  '"User: " + (log.operationUserName || "-") + "<br>" +' +
  '(log.photoUrl ? "<img src='" + log.photoUrl + "' alt='Foto Log'>" : "") +' +
  '"</div>";' +
  '});' +
  'document.getElementById("result").innerHTML = html;' +
  '});' +
  '</script>' +
  '</body>' +
  '</html>';
}
