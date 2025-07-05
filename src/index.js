addEventListener('fetch', event => { event.respondWith(handleRequest(event.request)) })

async function handleRequest(request) { const { pathname, searchParams } = new URL(request.url)

if (pathname === '/api') { return await handleApi(searchParams) } else { return new Response(renderPage(), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } }) } }

async function handleApi(searchParams) { const resi = searchParams.get('resi'); const pin = searchParams.get('pin');

if (!resi || !pin) { return new Response(JSON.stringify({ error: 'Nomor resi dan pin harus diisi.' }), { status: 400, headers: { 'Content-Type': 'application/json' } }) }

const apiUrl = 'https://rest.idexpress.com/client/overt/track/attest/web/' + resi + ',' + pin;

try { const response = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }); const data = await response.json();

if (data.code !== 0 || !data.data || data.data.length === 0) { return new Response(JSON.stringify({ error: 'Data tidak ditemukan.' }), { status: 404, headers: { 'Content-Type': 'application/json' } }); } return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }); 

} catch (e) { return new Response(JSON.stringify({ error: 'Gagal mengambil data.' }), { status: 500, headers: { 'Content-Type': 'application/json' } }); } }

function renderPage() { return '' + '

' + '' + '' + '' + 'Cek Resi ID Express' + '' + 'body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #74ebd5, #ACB6E5); }' + '.container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 600px; width: 100%; }' + 'h1 { text-align: center; margin-bottom: 20px; }' + 'input, button { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }' + 'button { background: #007BFF; color: white; cursor: pointer; }' + 'button:hover { background: #0056b3; }' + '.loading { text-align: center; margin-top: 20px; display: none; }' + '.result { margin-top: 20px; max-height: 500px; overflow-y: auto; word-wrap: break-word; white-space: pre-wrap; }' + 'img { max-width: 100%; margin-top: 10px; border-radius: 10px; }' + '.log-item { background: #f9f9f9; padding: 10px; border-left: 4px solid #007BFF; margin-bottom: 10px; border-radius: 5px; cursor: pointer; }' + '.log-detail { display: none; padding-top: 10px; }' + '.dark-mode { background: linear-gradient(135deg, #1c1c1c, #434343); color: white; }' + '.dark-mode .container { background: #333; color: white; }' + '' + '' + '' + '

' + '

Cek Resi ID Express

' + '' + '' + '' + 'Lacak' + '' + '

Loading...

' + 'Mode Gelap' + '

' + '

' + '' + 'function toggleDarkMode() { document.body.classList.toggle(&quot;dark-mode&quot;); }' + 'document.getElementById(&quot;form&quot;).addEventListener(&quot;submit&quot;, async function(e) {' + 'e.preventDefault();' + 'document.getElementById(&quot;loading&quot;).style.display = &quot;block&quot;;' + 'document.getElementById(&quot;result&quot;).innerHTML = &quot;&quot;;' + 'var resi = document.getElementById(&quot;resi&quot;).value.trim();' + 'var pin = document.getElementById(&quot;pin&quot;).value.trim();' + 'var response = await fetch(&quot;/api?resi=&quot; + resi + &quot;&amp;pin=&quot; + pin);' + 'document.getElementById(&quot;loading&quot;).style.display = &quot;none&quot;;' + 'if (!response.ok) { document.getElementById(&quot;result&quot;).innerHTML = &quot;&lt;p style=&quot;color:red;&quot;&gt;Resi tidak ditemukan atau server error.</p>&quot;; return; }' + 'var data = await response.json();' + 'var detail = data.data[0];' + 'var logs = detail.scanLineVOS;' + 'var html = &quot;<h3>Pengirim: &quot; + detail.senderName + &quot; (&quot; + detail.senderCityName + &quot;)</h3>&quot;;' + 'html += &quot;<h3>Penerima: &quot; + detail.recipientName + &quot; (&quot; + detail.recipientCityName + &quot;)</h3>&quot;;' + 'html += &quot;<h4>Status: &quot; + detail.waybillStatus + &quot;</h4>&quot;;' + 'if (detail.photoUrl) { html += &quot;&lt;img src='&quot; + detail.photoUrl + &quot;' alt='Bukti Pengiriman'&gt;&quot;; }' + 'html += &quot;<h3>Log Perjalanan:</h3>&quot;;' + 'for (var i = 0; i &lt; logs.length; i++) {' + 'var log = logs[i];' + 'html += &quot;&lt;div class=&quot;log-item&quot; onclick=&quot;toggleDetail('log&quot; + i + &quot;')&quot;&gt;<strong>&quot; + log.operationTime + &quot;</strong><br>&quot; +' + '(log.operationBranchName || &quot;-&quot;) + &quot; ke &quot; + (log.nextBranchName || &quot;-&quot;) + &quot;<br>&quot; +' + '&quot;User: &quot; + (log.operationUserName || &quot;-&quot;) + &quot;&lt;div class=&quot;log-detail&quot; id=&quot;log&quot; + i + &quot;&quot;&gt;&quot; +' + '&quot;<p><strong>Bag No:</strong> &quot; + log.bagNo + &quot;</p>&quot; +' + '&quot;<p><strong>Plat:</strong> &quot; + log.licensePlate + &quot;</p>&quot; +' + '&quot;<p><strong>Kendaraan:</strong> &quot; + log.vehicleTagNo + &quot;</p>&quot; +' + '&quot;<p><strong>Kurir:</strong> &quot; + log.courierName + &quot;</p>&quot; +' + '&quot;<p><strong>Driver:</strong> &quot; + log.driverName + &quot;</p>&quot;;' + 'if (log.photoUrl) { html += &quot;&lt;img src='&quot; + log.photoUrl + &quot;' alt='Foto Log'&gt;&quot;; }' + 'html += &quot;</div></div>&quot;;' + '}' + 'document.getElementById(&quot;result&quot;).innerHTML = html;' + '});' + 'function toggleDetail(id) {' + 'var el = document.getElementById(id);' + 'if (el.style.display === &quot;block&quot;) { el.style.display = &quot;none&quot;; } else { el.style.display = &quot;block&quot;; }' + '}' + '' + '' + ''; } 
