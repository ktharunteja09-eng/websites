const { spawn } = require('child_process');
const http = require('http');

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--remote-debugging-port=9222',
    'http://localhost:4173/'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  http.get('http://localhost:9222/json/list', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const targetTab = tabs.find(t => t.type === 'page' && t.url.includes('4173')) || tabs.find(t => t.type === 'page') || tabs[0];
      const wsUrl = targetTab.webSocketDebuggerUrl;
      const WebSocket = require('ws');
      const ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
        ws.send(JSON.stringify({ id: 3, method: 'Network.enable' }));
        ws.send(JSON.stringify({ id: 4, method: 'Page.reload' }));
      });

      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg.toString());
        if (parsed.method === 'Runtime.consoleAPICalled') {
          console.log('[CONSOLE]', parsed.params.type, parsed.params.args.map(a => a.value || a.description || a.type));
        }
        if (parsed.method === 'Runtime.exceptionThrown') {
          console.log('[EXCEPTION]', parsed.params.exceptionDetails.exception?.description || parsed.params.exceptionDetails.text);
        }
        if (parsed.method === 'Network.requestWillBeSent') {
          console.log('[REQ]', parsed.params.request.method, parsed.params.request.url);
        }
        if (parsed.method === 'Network.responseReceived') {
          console.log('[RES]', parsed.params.response.status, parsed.params.response.url);
        }
      });

      setTimeout(() => {
        ws.close();
        chrome.kill();
        process.exit(0);
      }, 3500);
    });
  });
}

main();
