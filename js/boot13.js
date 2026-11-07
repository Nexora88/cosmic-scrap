// Cosmic Scrap — 13×900b gzip chunks
(async()=>{
const boot=document.getElementById("boot");
try{
const parts=await Promise.all([fetch("js/u0.b64").then(r=>{if(!r.ok)throw new Error("u0 "+r.status);return r.text()}),
fetch("js/u1.b64").then(r=>{if(!r.ok)throw new Error("u1 "+r.status);return r.text()}),
fetch("js/u2.b64").then(r=>{if(!r.ok)throw new Error("u2 "+r.status);return r.text()}),
fetch("js/u3.b64").then(r=>{if(!r.ok)throw new Error("u3 "+r.status);return r.text()}),
fetch("js/u4.b64").then(r=>{if(!r.ok)throw new Error("u4 "+r.status);return r.text()}),
fetch("js/u5.b64").then(r=>{if(!r.ok)throw new Error("u5 "+r.status);return r.text()}),
fetch("js/u6.b64").then(r=>{if(!r.ok)throw new Error("u6 "+r.status);return r.text()}),
fetch("js/u7.b64").then(r=>{if(!r.ok)throw new Error("u7 "+r.status);return r.text()}),
fetch("js/u8.b64").then(r=>{if(!r.ok)throw new Error("u8 "+r.status);return r.text()}),
fetch("js/u9.b64").then(r=>{if(!r.ok)throw new Error("u9 "+r.status);return r.text()}),
fetch("js/u10.b64").then(r=>{if(!r.ok)throw new Error("u10 "+r.status);return r.text()}),
fetch("js/u11.b64").then(r=>{if(!r.ok)throw new Error("u11 "+r.status);return r.text()}),
fetch("js/u12.b64").then(r=>{if(!r.ok)throw new Error("u12 "+r.status);return r.text()})]);
const B64=parts.map(p=>p.replace(/\s+/g,"")).join("");
const bin=Uint8Array.from(atob(B64),c=>c.charCodeAt(0));
const stream=new Response(bin).body.pipeThrough(new DecompressionStream("gzip"));
const html=await new Response(stream).text();
document.open();document.write(html);document.close();
}catch(e){if(boot)boot.textContent="Load failed: "+e.message;console.error(e)}
})();
