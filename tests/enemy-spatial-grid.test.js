import test from "node:test";
import assert from "node:assert/strict";
import {EnemySpatialGrid} from "../js/systems/EnemySpatialGrid.js";

test("spatial grid returns nearby enemies across cell boundaries",()=>{
  const near={x:95,y:95,dead:false},edge={x:105,y:95,dead:false},far={x:420,y:420,dead:false};
  const grid=new EnemySpatialGrid(96).rebuild([near,edge,far]);
  const results=grid.query(100,100,24);
  assert.ok(results.includes(near));
  assert.ok(results.includes(edge));
  assert.ok(!results.includes(far));
});

test("spatial grid rebuild excludes dead enemies and does not retain removed entities",()=>{
  const live={x:40,y:40,dead:false},dead={x:42,y:40,dead:true};
  const grid=new EnemySpatialGrid().rebuild([live,dead]);
  assert.deepEqual(grid.query(40,40,20),[live]);
  live.dead=true;
  grid.rebuild([live,dead]);
  assert.deepEqual(grid.query(40,40,20),[]);
});

test("spatial grid supports negative off-screen coordinates and empty queries",()=>{
  const enemy={x:-20,y:-20,dead:false};
  const grid=new EnemySpatialGrid().rebuild([enemy]);
  assert.deepEqual(grid.query(-20,-20,5),[enemy]);
  assert.deepEqual(grid.query(800,800,5),[]);
});
