import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
async function loadLocalEnv() {
  try {
    const raw = await fs.readFile(path.join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.*?)\s*$/);
      if (m && !process.env.ELEVENLABS_API_KEY) process.env.ELEVENLABS_API_KEY = m[1].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
const clips = [
  ["mission-start", "Pilot, prepare for deployment.", "Pilot, göreve hazır ol.", "Piloto, prepare-se para a missão."],
  ["enemies-approaching", "Hostiles approaching.", "Düşmanlar yaklaşıyor.", "Inimigos se aproximando."],
  ["boss-start", "Boss encounter initiated.", "Boss savaşı başlıyor.", "O combate contra o chefe começou."],
  ["boss-defeated", "Boss neutralized.", "Boss etkisiz hale getirildi.", "Chefe neutralizado."],
  ["level-up", "Level up.", "Seviye yükseltildi.", "Nível aumentado."],
  ["sector-secured", "Sector secured. Excellent work.", "Bölge güvence altına alındı. İyi iş çıkardın.", "Setor protegido. Excelente trabalho."]
];
const locales = [{code:"tr",column:1},{code:"en",column:0},{code:"pt-BR",column:2}];
const voices = [
  {gender:"male",ids:{tr:"cPBqJ26VaZXIGAxXxtvc",en:"exurTFaGNF2gnRcPNH8I","pt-BR":"oBihj8LAmKfHZ1oauBtA"}},
  {gender:"female",ids:{tr:"Xen0soH4tcGo78ododZU",en:"6EX2laahUbO3ntDUNBKu","pt-BR":"B2J9b1PGBDt65GMZeYtU"}}
];
const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
async function generate(key,voiceId,text,target) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  for (let attempt=0; attempt<5; attempt++) {
    let res;
    try {
      res = await fetch(url,{method:"POST",headers:{"xi-api-key":key,"Content-Type":"application/json","Accept":"audio/mpeg"},body:JSON.stringify({text,model_id:"eleven_multilingual_v2",voice_settings:{stability:0.55,similarity_boost:0.8,style:0.2,use_speaker_boost:true}})});
    } catch(e) {
      if(attempt===4) throw e;
      await sleep(3000*(attempt+1)); continue;
    }
    if(res.ok) {
      const data=Buffer.from(await res.arrayBuffer());
      if(data.length<1000) throw new Error("Audio response too small: "+target);
      await fs.mkdir(path.dirname(target),{recursive:true});
      await fs.writeFile(target,data); return data.length;
    }
    const detail=await res.text();
    if(![429,500,502,503,504].includes(res.status)||attempt===4) throw new Error(`ElevenLabs HTTP ${res.status}: ${detail.slice(0,400)}`);
    const retry=Number(res.headers.get("retry-after"));
    const wait=Number.isFinite(retry)&&retry>0?retry*1000:Math.min(60000,5000*(2**attempt));
    console.log(`Service busy (HTTP ${res.status}); retrying in ${Math.round(wait/1000)}s.`);
    await sleep(wait);
  }
  throw new Error("Generation attempts exhausted.");
}
await loadLocalEnv();
const key=process.env.ELEVENLABS_API_KEY;
if(!key){console.error("Missing ELEVENLABS_API_KEY. Add it to .env.local on this PC; never paste it into chat.");process.exit(1);}
const jobs=voices.flatMap(v=>locales.map(l=>({gender:v.gender,language:l.code,voiceId:v.ids[l.code],items:clips.map(c=>({filename:c[0],text:c[l.column+1]}))})));
const total=jobs.reduce((n,j)=>n+j.items.length,0); let done=0;
console.log(`Generating ${total} commander voice clips sequentially.`);
for(const job of jobs) for(const item of job.items) {
  const target=path.join(ROOT,"assets","sounds","voice",job.gender,job.language,item.filename+".mp3");
  if(await fs.access(target).then(()=>true).catch(()=>false)){console.log("SKIP existing: "+path.relative(ROOT,target));done++;continue;}
  const bytes=await generate(key,job.voiceId,item.text,target); done++;
  console.log(`[${done}/${total}] ${path.relative(ROOT,target)} (${bytes} bytes)`);
  await sleep(900);
}
console.log("All 36 commander voice clips generated.");
