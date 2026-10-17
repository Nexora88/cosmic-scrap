import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};
const url = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

type Player = {
  userId: string; x: number; y: number; hp: number; alive: boolean;
  score: number; damage: number; kills: number; input: { dx: number; dy: number; shoot: boolean };
  lastSeenAt: number; shotCooldown: number;
};
type Enemy = { id: number; x: number; y: number; hp: number; speed: number; radius: number; attackCooldown: number; boss: boolean };
type Bullet = { id: number; ownerId: string; x: number; y: number; vx: number; vy: number; ttl: number };
type SimState = {
  seed: number; rng: number; elapsedMs: number; nextSpawnMs: number; nextEnemyId: number; nextBulletId: number;
  createdAt: number; startedAt: number | null; readyUsers: string[]; lastBossWave:number; bossesDefeated:number;
  players: Player[]; enemies: Enemy[]; bullets: Bullet[]; status: "playing" | "finished";
  mode: "coop" | "ranked"; sharedHealth: number; sharedLives: number; sharedScore: number; sharedKills: number;
  winnerUserId: string | null; finishReason: string | null;
};
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : 0));
const distance = (a: {x:number;y:number}, b: {x:number;y:number}) => Math.hypot(a.x-b.x, a.y-b.y);
function seeded(seed: number) {
  let x = (seed >>> 0) || 0x6d2b79f5;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
}
function initialState(mode: "coop" | "ranked", ids: string[], seed: number): SimState {
  const random = seeded(seed);
  return {
    seed, rng: Math.floor(random() * 0xffffffff) >>> 0, elapsedMs: 0, nextSpawnMs: 900,
    createdAt:Date.now(), startedAt:null, readyUsers:[], lastBossWave:0, bossesDefeated:0,
    nextEnemyId: 1, nextBulletId: 1,
    players: ids.map((userId, i) => ({
      userId, x: i === 0 ? 360 : 640, y: 500, hp: 100, alive: true,
      score: 0, damage: 0, kills: 0, input: { dx: 0, dy: 0, shoot: false },
      lastSeenAt: 0, shotCooldown: 0,
    })),
    enemies: [], bullets: [], status: "playing", mode, sharedHealth: 100, sharedLives: 3,
    sharedScore: 0, sharedKills: 0, winnerUserId: null, finishReason: null,
  };
}
function random01(s: SimState) {
  let x = (s.rng >>> 0) || 0x9e3779b9;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  s.rng = x >>> 0;
  return s.rng / 4294967296;
}
function pickTarget(s: SimState, e: Enemy): Player | null {
  const living = s.players.filter(p => p.alive);
  if (!living.length) return null;
  if (s.mode === "coop") return living.sort((a,b) => distance(a,e)-distance(b,e))[0];
  return living.sort((a,b) => distance(a,e)-distance(b,e))[0];
}
function finishRanked(s: SimState, reason: string) {
  if (s.status === "finished") return;
  const [a,b] = s.players;
  let winner: string | null = null;
  if (a.alive !== b.alive) winner = a.alive ? a.userId : b.userId;
  else if (a.score !== b.score) winner = a.score > b.score ? a.userId : b.userId;
  else if (a.damage !== b.damage) winner = a.damage < b.damage ? a.userId : b.userId;
  s.status = "finished"; s.winnerUserId = winner; s.finishReason = reason;
}
function step(s: SimState, dt: number, now: number) {
  if (s.status !== "playing") return;
  dt = clamp(dt, 0, 0.25);
  const ms = dt * 1000;
  s.elapsedMs += ms;
  const wave = 1 + Math.floor(s.elapsedMs / 20000);
  const spawnEvery = Math.max(350, 1050 - wave * 45);
  s.nextSpawnMs -= ms;
  if (s.nextSpawnMs <= 0) {
    const edge = Math.floor(random01(s) * 4);
    const pos = edge === 0 ? {x: 20, y: random01(s)*980+10}
      : edge === 1 ? {x: 980, y: random01(s)*980+10}
      : edge === 2 ? {x: random01(s)*980+10, y: 20}
      : {x: random01(s)*980+10, y: 980};
    if (wave >= 5 && wave % 5 === 0 && s.lastBossWave < wave) {
      s.enemies.push({id:s.nextEnemyId++,...pos,hp:320+wave*18,speed:28+Math.min(18,wave),radius:28,attackCooldown:0,boss:true});
      s.lastBossWave=wave;
    } else if (s.enemies.length < Math.min(28, 5 + wave * 2)) {
      s.enemies.push({id:s.nextEnemyId++,...pos,hp:20+wave*4,speed:42+Math.min(50,wave*2),radius:13,attackCooldown:0,boss:false});
    }
    s.nextSpawnMs = spawnEvery;
  }
  for (const p of s.players) {
    if (now - p.lastSeenAt > 1200) p.input = { dx: 0, dy: 0, shoot: false };
    if (!p.alive) continue;
    const mag = Math.hypot(p.input.dx, p.input.dy) || 1;
    p.x = clamp(p.x + (p.input.dx/mag) * 210 * dt, 20, 980);
    p.y = clamp(p.y + (p.input.dy/mag) * 210 * dt, 20, 980);
    p.shotCooldown = Math.max(0, p.shotCooldown - ms);
    if (p.input.shoot && p.shotCooldown <= 0 && s.enemies.length) {
      const target = s.enemies.slice().sort((a,b)=>distance(p,a)-distance(p,b))[0];
      const d = distance(p,target) || 1;
      s.bullets.push({id:s.nextBulletId++, ownerId:p.userId, x:p.x, y:p.y, vx:(target.x-p.x)/d*430, vy:(target.y-p.y)/d*430, ttl:1.4});
      p.shotCooldown = 260;
    }
  }
  for (const e of s.enemies) {
    e.attackCooldown = Math.max(0, e.attackCooldown-ms);
    const target = pickTarget(s,e);
    if (!target) continue;
    const d = distance(e,target) || 1;
    if (d > 19) { e.x += (target.x-e.x)/d*e.speed*dt; e.y += (target.y-e.y)/d*e.speed*dt; }
    else if (e.attackCooldown <= 0) {
      if (s.mode === "coop") {
        s.sharedHealth -= 8;
        for (const p of s.players) if (p.alive) p.damage += 8;
        if (s.sharedHealth <= 0) {
          s.sharedLives -= 1;
          if (s.sharedLives <= 0) { s.status="finished"; s.finishReason="team_eliminated"; }
          else s.sharedHealth = 100;
        }
      } else {
        target.hp -= 8; target.damage += 8;
        if (target.hp <= 0) target.alive = false;
      }
      e.attackCooldown = 700;
    }
  }
  const aliveBullets: Bullet[] = [];
  for (const b of s.bullets) {
    b.x += b.vx*dt; b.y += b.vy*dt; b.ttl -= dt;
    const hit = s.enemies.find(e => e.hp > 0 && distance(e,b) < e.radius+5);
    if (hit) {
      hit.hp -= 20;
      if (hit.hp <= 0) {
        const owner = s.players.find(p=>p.userId===b.ownerId);
        const reward=hit.boss?1000:100;
        if (owner) { owner.score += reward; owner.kills += 1; }
        s.sharedScore += reward; s.sharedKills += 1;
        if(hit.boss) s.bossesDefeated += 1;
      }
    } else if (b.ttl > 0 && b.x >= 0 && b.x <= 1000 && b.y >= 0 && b.y <= 1000) aliveBullets.push(b);
  }
  s.bullets = aliveBullets;
  s.enemies = s.enemies.filter(e=>e.hp>0);
  if (s.mode === "ranked") {
    const [a,b] = s.players;
    for (const p of s.players) if (p.alive && now-p.lastSeenAt > 25000) p.alive = false;
    if (a.alive !== b.alive) finishRanked(s,"elimination_or_disconnect");
    else if (!a.alive && !b.alive) finishRanked(s,"double_elimination");
    else if (s.elapsedMs >= 180000) finishRanked(s,"time_limit");
  } else if (s.sharedLives <= 0 || s.elapsedMs >= 240000) {
    s.status = "finished"; s.finishReason = s.sharedLives <= 0 ? "team_eliminated" : "time_limit";
  }
}
function publicSnapshot(s: SimState, version: number) {
  return {
    version, mode:s.mode, status:s.status, elapsed_ms:Math.floor(s.elapsedMs),
    waiting_for_players:s.startedAt===null, ready_count:s.readyUsers.length,
    wave:1+Math.floor(s.elapsedMs/20000), shared_health:s.sharedHealth, shared_lives:s.sharedLives,
    shared_score:s.sharedScore, shared_kills:s.sharedKills, bosses_defeated:s.bossesDefeated, winner_user_id:s.winnerUserId,
    finish_reason:s.finishReason,
    players:s.players.map(p=>({user_id:p.userId,x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,hp:p.hp,alive:p.alive,score:p.score,damage:p.damage,kills:p.kills})),
    enemies:s.enemies.map(e=>({id:e.id,x:Math.round(e.x*10)/10,y:Math.round(e.y*10)/10,hp:e.hp,radius:e.radius})),
    bullets:s.bullets.map(b=>({id:b.id,owner_id:b.ownerId,x:Math.round(b.x*10)/10,y:Math.round(b.y*10)/10})),
  };
}
async function json(req: Request) {
  try {
    const raw=await req.text();
    if(raw.length>8192) throw new Error("Request body too large");
    return raw ? JSON.parse(raw) : {};
  } catch(error) { throw error; }
}
function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {status,headers:cors});
}
async function ensureSimulation(mode:"coop"|"ranked", id:string, ids:string[], seed:number, key:"room_id"|"ranked_match_id") {
  let {data,error}=await admin.from("online_simulations").select("*").eq(key,id).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const state=initialState(mode,ids,seed);
  const inserted=await admin.from("online_simulations").insert({[key]:id,mode,state,status:"playing"}).select("*").single();
  if (!inserted.error && inserted.data) return inserted.data;
  const retry=await admin.from("online_simulations").select("*").eq(key,id).maybeSingle();
  if (retry.error || !retry.data) throw inserted.error || retry.error || new Error("Could not create simulation state");
  return retry.data;
}
async function saveCoopResult(roomId:string, s:SimState) {
  if (s.mode!=="coop" || s.status!=="finished") return;
  const [host,guest]=s.players;
  const result=await admin.from("coop_match_stats").upsert({
    room_id:roomId,host_user_id:host.userId,guest_user_id:guest.userId,
    shared_score:Math.max(0,Math.floor(s.sharedScore)),
    shared_kills:Math.max(0,Math.floor(s.sharedKills)),
    bosses_defeated:Math.max(0,Math.floor(s.bossesDefeated)),
    survival_seconds:Math.max(0,Math.min(14400,Math.floor(s.elapsedMs/1000))),
    team_lives_remaining:clamp(s.sharedLives,0,3),
    finish_reason:s.finishReason==="time_limit"?"time_limit":"team_eliminated",
    finished_at:new Date().toISOString(),
  },{onConflict:"room_id",ignoreDuplicates:true});
  if(result.error) throw result.error;
}
async function finalizeIfNeeded(matchId:string, s:SimState) {
  if (s.mode!=="ranked" || s.status!=="finished") return;
  const {data:match,error}=await admin.from("ranked_duel_matches")
    .select("id,status,player_a_id,player_b_id").eq("id",matchId).single();
  if (error || !match || match.status!=="playing") return;
  const [a,b]=s.players;
  const outcome=s.winnerUserId===a.userId ? "a_win" : s.winnerUserId===b.userId ? "b_win" : "draw";
  const result=await admin.rpc("finalize_ranked_duel",{
    p_match_id:matchId,p_outcome:outcome,p_score_a:a.score,p_score_b:b.score,p_damage_a:a.damage,p_damage_b:b.damage,
  });
  if (result.error) throw result.error;
}
Deno.serve(async (req: Request) => {
  if (req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if (req.method!=="POST") return response({error:"POST required"},405);
  try {
    const authHeader=req.headers.get("Authorization")||"";
    const token=authHeader.startsWith("Bearer ")?authHeader.slice(7):"";
    if (!token) return response({error:"Sign in required"},401);
    const caller=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:"Bearer "+token}}});
    const {data:authData,error:authError}=await caller.auth.getUser(token);
    if(authError||!authData.user) return response({error:"Invalid session"},401);
    const userId=authData.user.id;
    let body;
    try { body=await json(req); } catch { return response({error:"Invalid or oversized request body"},413); }
    const action=String(body.action||"");
    if(action==="ranked_cancel"){
      const del=await admin.from("ranked_matchmaking_queue").delete().eq("user_id",userId);
      if(del.error) throw del.error;
      return response({status:"cancelled"});
    }
    let mode:"coop"|"ranked", id:string, key:"room_id"|"ranked_match_id", ids:string[], seed:number;
    if(action==="coop_start"||action==="coop_tick"){
      id=String(body.room_id||"");
      if(!/^[0-9a-f-]{36}$/i.test(id)) return response({error:"Valid room_id required"},400);
      const {data:room,error}=await admin.from("coop_rooms").select("id,host_user_id,guest_user_id,status,room_mode,expires_at")
        .eq("id",id).maybeSingle();
      if(error) throw error;
      if(!room||![room.host_user_id,room.guest_user_id].includes(userId)||new Date(room.expires_at).getTime()<Date.now())
        return response({error:"Room unavailable or access denied"},403);
      if(room.room_mode!=="friend"||!room.guest_user_id||!["ready","playing"].includes(room.status))
        return response({error:"Co-op requires a friend room with both pilots joined"},409);
      if(room.status==="ready") await admin.from("coop_rooms").update({status:"playing",started_at:new Date().toISOString()}).eq("id",id).eq("status","ready");
      mode="coop"; key="room_id"; ids=[room.host_user_id,room.guest_user_id];
      seed=[...id].reduce((a,ch)=>(Math.imul(a,31)+ch.charCodeAt(0))>>>0,0x51f15e);
      if(action==="coop_start") await ensureSimulation(mode,id,ids,seed,key);
    } else if(action==="ranked_join"){
      const {data:claim,error}=await admin.rpc("claim_ranked_opponent",{p_user_id:userId});
      if(error) throw error;
      if(claim?.status!=="matched") return response({status:"queued",rating:claim?.rating,queued_at:claim?.queued_at});
      id=claim.match_id; mode="ranked"; key="ranked_match_id"; ids=[claim.player_a_id,claim.player_b_id]; seed=Number(claim.server_seed)||1;
      await ensureSimulation(mode,id,ids,seed,key);
      return response({status:"matched",match_id:id,players:ids});
    } else if(action==="ranked_tick"){
      id=String(body.match_id||"");
      if(!/^[0-9a-f-]{36}$/i.test(id)) return response({error:"Valid match_id required"},400);
      const {data:match,error}=await admin.from("ranked_duel_matches").select("id,player_a_id,player_b_id,status,server_seed")
        .eq("id",id).maybeSingle();
      if(error) throw error;
      if(!match||![match.player_a_id,match.player_b_id].includes(userId)) return response({error:"Match unavailable or access denied"},403);
      if(match.status!=="playing") {
        const {data:finishedSim,error:simError}=await admin.from("online_simulations").select("*").eq("ranked_match_id",id).maybeSingle();
        if(simError) throw simError;
        if(finishedSim) return response(publicSnapshot(finishedSim.state as SimState,finishedSim.version));
        return response({status:match.status,match_id:id});
      }
      mode="ranked"; key="ranked_match_id"; ids=[match.player_a_id,match.player_b_id]; seed=Number(match.server_seed)||1;
    } else return response({error:"Unknown action"},400);

    const inputBody=body.input||{};
    const input={dx:clamp(Number(inputBody.dx),-1,1),dy:clamp(Number(inputBody.dy),-1,1),shoot:Boolean(inputBody.shoot)};
    for(let attempt=0;attempt<4;attempt++){
      const {data:row,error:readError}=await admin.from("online_simulations").select("*").eq(key,id).maybeSingle();
      if(readError) throw readError;
      if(!row) return response({error:"Simulation not found"},404);
      if(row.status==="finished"){
        if(row.mode==="ranked") await finalizeIfNeeded(id,row.state as SimState);
        else await saveCoopResult(id,row.state as SimState);
        return response(publicSnapshot(row.state as SimState,row.version));
      }
      const s=structuredClone(row.state) as SimState;
      const player=s.players.find(p=>p.userId===userId);
      if(!player) return response({error:"Not a participant"},403);
      const now=Date.now();
      // Per-player server-side input throttle; it does not rely on client timestamps.
      if(player.lastSeenAt>0 && now-player.lastSeenAt<60) return response(publicSnapshot(row.state as SimState,row.version));
      player.input=input; player.lastSeenAt=now;
      if(!Array.isArray(s.readyUsers)) s.readyUsers=[];
      if(!s.readyUsers.includes(userId)) s.readyUsers.push(userId);
      const lastTick=new Date(row.last_tick_at).getTime();
      let dt=clamp((now-lastTick)/1000,0,0.25);
      if(s.startedAt===null && s.readyUsers.length>=s.players.length) {
        s.startedAt=now;
        dt=0; // both clients are ready; neither gets a head start
      } else if(s.startedAt===null) {
        dt=0;
        if(s.mode==="ranked" && now-s.createdAt>25000) {
          const absent=s.players.find(p=>!s.readyUsers.includes(p.userId));
          if(absent) absent.alive=false;
          finishRanked(s,"opponent_failed_to_connect");
        }
      } else {
        step(s,dt,now);
      }
      const nextStatus=s.status;
      const {data:updated,error:updateError}=await admin.from("online_simulations")
        .update({state:s,version:row.version+1,last_tick_at:new Date(now).toISOString(),status:nextStatus,finished_at:nextStatus==="finished"?new Date(now).toISOString():null})
        .eq("id",row.id).eq("version",row.version).select("version").maybeSingle();
      if(updateError) throw updateError;
      if(!updated) continue;
      if(s.status==="finished") {
        if(s.mode==="ranked") await finalizeIfNeeded(id,s);
        else await saveCoopResult(id,s);
      }
      return response(publicSnapshot(s,row.version+1));
    }
    const {data:latest,error}=await admin.from("online_simulations").select("*").eq(key,id).single();
    if(error) throw error;
    return response(publicSnapshot(latest.state as SimState,latest.version));
  } catch(error) {
    console.error("online-match error",error);
    return response({error:error instanceof Error?error.message:"Online service failed"},500);
  }
});
