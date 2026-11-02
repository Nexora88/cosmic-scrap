const CELL_SIZE=96;
export class EnemySpatialGrid{
 constructor(cellSize=CELL_SIZE){this.cellSize=cellSize;this.cells=new Map()}
 key(x,y){return Math.floor(x/this.cellSize)+":"+Math.floor(y/this.cellSize)}
 rebuild(enemies){
  this.cells.clear();
  for(const enemy of enemies){
   if(enemy.dead)continue;
   const key=this.key(enemy.x,enemy.y);
   let bucket=this.cells.get(key);
   if(!bucket){bucket=[];this.cells.set(key,bucket)}
   bucket.push(enemy);
  }
  return this;
 }
 query(x,y,radius=64){
  const minX=Math.floor((x-radius)/this.cellSize),maxX=Math.floor((x+radius)/this.cellSize);
  const minY=Math.floor((y-radius)/this.cellSize),maxY=Math.floor((y+radius)/this.cellSize);
  const found=[];
  for(let cy=minY;cy<=maxY;cy++)for(let cx=minX;cx<=maxX;cx++){
   const bucket=this.cells.get(cx+":"+cy);
   if(bucket)found.push(...bucket);
  }
  return found;
 }
}
