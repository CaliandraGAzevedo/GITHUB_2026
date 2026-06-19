// game_instance.js - Refatoração: GameInstance encapsula estado, lógica e render

const COLS = 10, ROWS = 20, BLOCK = 24;
const COLORS = [null,'#FF5733','#33C1FF','#9B59B6','#F1C40F','#2ECC71','#E67E22','#3498DB'];
const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]]
};
const SHAPE_KEYS = Object.keys(SHAPES);

class GameInstance{
  constructor({canvas, nextCanvas, effectCanvas, sound=null, ai=null, onScore, onTime, onAIStatus}){
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.ctx.imageSmoothingEnabled=false;
    this.nextCanvas = nextCanvas; this.nctx = nextCanvas.getContext('2d');
    this.effectCanvas = effectCanvas; this.ectx = effectCanvas.getContext('2d');
    this.sound = sound; this.ai = ai;
    this.onScore = onScore; this.onTime = onTime; this.onAIStatus = onAIStatus;

    this.grid = this.createMatrix(COLS,ROWS);
    this.current = null; this.nextPiece = this.randomPiece();
    this.score = 0; this.startTime = null; this.running=false; this.paused=false; this.gameOver=false;
    this.dropInterval = 700; this.dropCounter=0; this.lastTime=0;

    this.particles=[]; this.effectAnim=null;

    // input assist toggle
    this.assist = true;

    this.resize(); window.addEventListener('resize', ()=>this.resize());
    this.initTitleTripleClick();
    this.render();
  }

  setMode(m){ this.mode = m; if(this.onAIStatus) this.onAIStatus(`Modo: ${m}`); }
  togglePause(){ this.paused = !this.paused; }

  start(){ this.reset(); this.running=true; this.paused=false; this.startTime=Date.now(); requestAnimationFrame(t=>this.update(t)); }
  reset(){ this.grid = this.createMatrix(COLS,ROWS); this.current = this.spawnPiece(); this.nextPiece = this.randomPiece(); this.score=0; this.gameOver=false; this.updateScore(); }

  handleKey(e){ if(!this.running) return; if(this.paused) return; if(e.key==='ArrowLeft') this.move(-1); if(e.key==='ArrowRight') this.move(1); if(e.key==='ArrowDown') this.softDrop(); if(e.key==='ArrowUp') this.rotate(1); if(e.code==='Space') this.hardDrop(); if(e.key==='h'||e.key==='H') { this.assist=!this.assist; if(this.onAIStatus) this.onAIStatus('Assistência IA: '+(this.assist?'ON':'OFF')); } }

  resize(){ /* keep canvas size fixed for deterministic blocks; no-op for now */ }

  update(time=0){ if(!this.running) return; const delta = time - this.lastTime; this.lastTime=time; if(!this.paused){ this.dropCounter += delta; if(this.dropCounter > this.dropInterval){ this.drop(); this.dropCounter=0; } this.updateTimer(); }
    this.render(); if(!this.gameOver) requestAnimationFrame(t=>this.update(t)); }

  updateTimer(){ if(!this.startTime) return; const s = Math.floor((Date.now()-this.startTime)/1000); const mm = String(Math.floor(s/60)).padStart(2,'0'); const ss = String(s%60).padStart(2,'0'); if(this.onTime) this.onTime(`${mm}:${ss}`); }

  createMatrix(w,h){ let m=[]; for(let y=0;y<h;y++) m[y]=new Array(w).fill(0); return m; }
  randomPiece(){ const k = SHAPE_KEYS[Math.floor(Math.random()*SHAPE_KEYS.length)]; const shape = SHAPES[k].map(r=>r.slice()); const id = SHAPE_KEYS.indexOf(k)+1; return {key:k,shape,id}; }
  spawnPiece(){ const p = this.nextPiece || this.randomPiece(); this.nextPiece = this.randomPiece(); p.x = Math.floor(COLS/2) - Math.ceil(p.shape[0].length/2); p.y = 0; return p; }

  drop(){ if(!this.current) this.current = this.spawnPiece(); this.current.y++; if(this.collide(this.grid,this.current)){ this.current.y--; this.merge(this.grid,this.current); const cleared = this.sweepLines(); if(cleared>0){ this.score += cleared*100; if(this.sound) this.sound.play('line'); this.spawnStars(cleared*20); } this.current = this.spawnPiece(); if(this.collide(this.grid,this.current)){ this.gameOver=true; this.running=false; if(this.sound) this.sound.play('gameover'); } this.updateScore(); }
  }

  softDrop(){ this.current.y++; if(this.collide(this.grid,this.current)) this.current.y--; }
  hardDrop(){ while(!this.collide(this.grid,this.current)) this.current.y++; this.current.y--; this.merge(this.grid,this.current); const cleared = this.sweepLines(); if(cleared>0){ this.score += cleared*100; if(this.sound) this.sound.play('line'); this.spawnStars(cleared*20); } this.current = this.spawnPiece(); this.updateScore(); }
  move(dir){ this.current.x += dir; if(this.collide(this.grid,this.current)) this.current.x -= dir; }

  rotate(dir){ const prev = this.current.shape.map(r=>r.slice()); this.current.shape = this.rotateMatrix(this.current.shape, dir); let kicked=false; for(let i=0;i<3;i++){ const dx = (i%2===0? i+1: -(i+1)); this.current.x += dx; if(!this.collide(this.grid,this.current)){ kicked=true; break; } this.current.x -= dx; } if(!kicked && this.collide(this.grid,this.current)) this.current.shape = prev; }

  rotateMatrix(m,dir){ const n = m.length; let res = Array.from({length:n},()=>Array(n).fill(0)); for(let y=0;y<n;y++)for(let x=0;x<n;x++) res[x][n-1-y]=m[y][x]; if(dir<0) for(let i=0;i<3;i++) res = this.rotateMatrix(res,1); return res; }

  collide(mat,piece){ for(let y=0;y<piece.shape.length;y++) for(let x=0;x<piece.shape[y].length;x++) if(piece.shape[y][x]){ const ny = piece.y+y; const nx = piece.x+x; if(ny<0) continue; if(nx<0 || nx>=COLS || ny>=ROWS) return true; if(mat[ny][nx]) return true; } return false; }
  merge(mat,piece){ for(let y=0;y<piece.shape.length;y++) for(let x=0;x<piece.shape[y].length;x++) if(piece.shape[y][x]){ const ny=piece.y+y, nx=piece.x+x; if(ny>=0 && ny<ROWS && nx>=0 && nx<COLS) mat[ny][nx]=piece.id; } }

  sweepLines(){ let rowCount=0; outer: for(let y=ROWS-1;y>=0;y--){ for(let x=0;x<COLS;x++) if(!this.grid[y][x]) continue outer; this.grid.splice(y,1); this.grid.unshift(new Array(COLS).fill(0)); rowCount++; y++; } return rowCount; }

  updateScore(){ if(this.onScore) this.onScore(this.score); }

  render(){ // board
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){ const v=this.grid[y][x]; if(v) this.drawBlockAt(this.ctx,x,y,COLORS[v]); }
    if(this.current){ const s=this.current.shape; for(let y=0;y<s.length;y++) for(let x=0;x<s[y].length;x++) if(s[y][x]) this.drawBlockAt(this.ctx,this.current.x+x,this.current.y+y,COLORS[this.current.id]); }
    // next
    this.nctx.clearRect(0,0,this.nextCanvas.width,this.nextCanvas.height);
    const s = this.nextPiece.shape; const scale = 20; this.nctx.save(); this.nctx.translate(10,10);
    for(let y=0;y<s.length;y++) for(let x=0;x<s[y].length;x++) if(s[y][x]){ this.nctx.fillStyle = COLORS[this.nextPiece.id]; this.nctx.fillRect(x*scale,y*scale,scale-2,scale-2); }
    this.nctx.restore();
    // effects
    this.stepEffects();
  }

  drawBlockAt(cx,x,y,color){ cx.fillStyle=color; cx.fillRect(x*BLOCK+1,y*BLOCK+1,BLOCK-2,BLOCK-2); cx.strokeStyle='rgba(255,255,255,0.06)'; cx.strokeRect(x*BLOCK+1,y*BLOCK+1,BLOCK-2,BLOCK-2); }

  // effects (particles)
  spawnStars(n){ for(let i=0;i<n;i++) this.particles.push({x:Math.random()*this.effectCanvas.width,y:120+Math.random()*200,vx:(Math.random()-0.5)*4,vy:-Math.random()*6-1,age:0,life:80,color:`hsl(${Math.random()*50+40},90%,60%)`}); if(!this.effectAnim) this.effectAnim=requestAnimationFrame(()=>this.stepEffects()); if(this.sound) this.sound.play('star'); }
  spawnStarRain(n=150){ for(let i=0;i<n;i++) this.particles.push({x:Math.random()*this.effectCanvas.width,y:-Math.random()*200,vx:(Math.random()-0.5)*2,vy:Math.random()*3+1,age:0,life:200,color:`hsl(${Math.random()*360},80%,70%)`}); if(!this.effectAnim) this.effectAnim=requestAnimationFrame(()=>this.stepEffects()); if(this.sound) this.sound.play('star-rain'); }

  stepEffects(){ this.ectx.clearRect(0,0,this.effectCanvas.width,this.effectCanvas.height); for(let i=this.particles.length-1;i>=0;i--){ const p=this.particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.age++; const a = 1 - p.age/p.life; this.ectx.fillStyle = p.color; this.ectx.globalAlpha = Math.max(0,a); this.drawStar(this.ectx,p.x,p.y,3); if(p.age>p.life) this.particles.splice(i,1); } this.ectx.globalAlpha=1; if(this.particles.length>0) this.effectAnim=requestAnimationFrame(()=>this.stepEffects()); else { cancelAnimationFrame(this.effectAnim); this.effectAnim=null; } }
  drawStar(c,x,y,r){ c.beginPath(); for(let i=0;i<5;i++){ c.lineTo(x+Math.cos((18+i*72)/180*Math.PI)*r, y- Math.sin((18+i*72)/180*Math.PI)*r); c.lineTo(x+Math.cos((54+i*72)/180*Math.PI)*(r/2), y- Math.sin((54+i*72)/180*Math.PI)*(r/2)); } c.closePath(); c.fill(); }

  initTitleTripleClick(){ const title = document.getElementById('title'); let clicks=[]; title.addEventListener('click', ()=>{ const now=Date.now(); clicks.push(now); if(clicks.length>3) clicks.shift(); if(clicks.length===3 && clicks[2]-clicks[0]<700){ this.spawnStarRain(180); clicks=[]; } }); }
}

window.GameInstance = GameInstance;
