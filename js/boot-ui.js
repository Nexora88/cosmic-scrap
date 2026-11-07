// Cosmic Scrap UI bootstrap — loads gzip B64 payload from companion file
(async () => {
  const boot = document.getElementById("boot");
  try {
    const res = await fetch("js/ui-payload.b64");
    const B64 = (await res.text()).trim();
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
