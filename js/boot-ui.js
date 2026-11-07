// Cosmic Scrap UI bootstrap — loads gzip B64 from 3 chunk files
(async () => {
  const boot = document.getElementById("boot");
  try {
    const parts = await Promise.all([
      fetch("js/ui-payload-0.b64").then(r => { if (!r.ok) throw new Error("chunk0 "+r.status); return r.text(); }),
      fetch("js/ui-payload-1.b64").then(r => { if (!r.ok) throw new Error("chunk1 "+r.status); return r.text(); }),
      fetch("js/ui-payload-2.b64").then(r => { if (!r.ok) throw new Error("chunk2 "+r.status); return r.text(); })
    ]);
    const B64 = parts.map(p => p.replace(/\s+/g, "")).join("");
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
