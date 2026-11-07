// Cosmic Scrap UI bootstrap — loads gzip B64 payload from chunked companion files
(async () => {
  const boot = document.getElementById("boot");
  try {
    const parts = await Promise.all([
fetch("js/ui-payload-0.b64").then(r=>r.text()), fetch("js/ui-payload-1.b64").then(r=>r.text()), fetch("js/ui-payload-2.b64").then(r=>r.text())
    ]);
    const B64 = parts.map(p => p.trim()).join("");
    const bin = Uint8Array.from(atob(B64), c => c.charCodeAt(0));
    const stream = new Response(bin).body.pipeThrough(new DecompressionStream("gzip"));
    const html = await new Response(stream).text();
    document.open();
    document.write(html);
    document.close();
  } catch (e) {
    if (boot) boot.textContent = "Load failed: " + e.message;
    console.error(e);
  }
})();
