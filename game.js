// game.js - Motor do Tetrix (versão simples e funcional)
// Implementa: tabuleiro, peças, rotação, queda, linha, placar, timer, efeitos de estrela

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

// Game state
let canvas = document.getElementById('board-canvas');
let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let nextCanvas = document.getElementById('next-canvas');
let nctx = nextCanvas.getContext('2d');

let effectCanvas = document.getElementById('effect-layer');
let ectx = effectCanvas.getContext('2d');

let modeSelect = document.getElementById('mode-select');
let startBtn = document.getElementById('start-btn');
let pauseBtn = document.getElementById('pause-btn');
let timerEl = document.getElementById('timer');
let scoreEl = document.getElementById('score');
let titleEl = document.getElementById('title');
let duelArea = document.getElementById('duel-area');
let boardsDiv = document.getElementById('boards');
let aiStatus = document.getElementById('ai-status');

let grid = createMatrix(COLS, ROWS);
let current = null;
let nextPiece = randomPiece();
let dropCounter = 0, dropInterval = 700;
let lastTime = 0;
let gameOver = false, running = false, paused = false;
let score = 0, startTime = null;

// For triple-click easter egg
let clickTimes = [];

// AI agent Asterix (basic integration) - uses ai.js
let asterix = new Asterix();

// Initialize
resizeCanvases();
render();

window.addEventListener('resize', resizeCanvases);
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
modeSelect.addEventListener('change', onModeChange);

// title triple-click detection
titleEl.addEventListener('click', ()=>{
  const now = Date.now();
  clickTimes.push(now);
  // keep last 3
  if (clickTimes.length>3) clickTimes.shift();
  if (clickTimes.length===3 && clickTimes[2]-clickTimes[0]<700){
    // trigger star rain
    spawnStarRain(150);
    clickTimes=[];
  }
});

// keyboard
window.addEventListener('keydown', e=>{
  if(!running||paused) return;
  if(e.key==='ArrowLeft'){move(-1)}
  if(e.key==='ArrowRight'){move(1)}
  if(e.key==='ArrowDown'){softDrop()}
  if(e.key==='ArrowUp'){rotate(1)}
  if(e.code==='Space'){hardDrop()}
  if(e.key==='p' || e.key==='P'){togglePause()}
});

function startGame(){
  reset();
  running = true; paused=false; gameOver=false; startTime = Date.now();
  if(modeSelect.value==='duelo') enterDuelMode();
  if(modeSelect.value==='dupla') enterDuplaMode();
  requestAnimationFrame(update);
}
function togglePause(){ paused = !paused; }

function reset(){
  grid = createMatrix(COLS, ROWS);
  current = spawnPiece();
  nextPiece = randomPiece();
  score = 0; updateUI();
}

function onModeChange(){
  if(modeSelect.value==='duelo'){
    boardsDiv.classList.add('hidden'); duelArea.classList.remove('hidden');
  } else { boardsDiv.classList.remove('hidden'); duelArea.classList.add('hidden'); }
}

function enterDuelMode(){
  aiStatus.innerText = 'Asterix pronto para duelo';
  // set up two boards
  // For simplicity we reuse separate canvases and asterix plays on board2
  const board1 = document.getElementById('board1');
  const b1 = board1.getContext('2d');
  const board2 = document.getElementById('board2');
  const b2 = board2.getContext('2d');
  // create independent game instances
  // For brevity we spawn a simple AI loop that plays on board2 and human on board1
  // Full implementation would factor game instances into classes; this is a prototype
  startDuelInstances(b1,b2);
}

function enterDuplaMode(){
  aiStatus.innerText = 'Modo dupla: você e Asterix controlando o mesmo tabuleiro. Pressione H para habilitar assistência da IA.';
  window.addEventListener('keydown', assistToggle);
}
function assistToggle(e){ if(e.key==='h' || e.key==='H'){ asterix.toggleAssist(); aiStatus.innerText = 'Assistência IA: '+(asterix.assist? 'ON':'OFF'); }}

// Basic duel instances (prototype)
function startDuelInstances(ctxHuman, ctxAI){
  // We'll run a simple interval where each instance runs its own small engine.
  const humanGrid = createMatrix(COLS, ROWS);
  const aiGrid = createMatrix(COLS, ROWS);
  let humanPiece = randomPiece();
  let aiPiece = randomPiece();
  let aiNext = randomPiece();

  function drawBoard(ctx, g){
    ctx.clearRect(0,0,240,480);
    for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
      const v = g[y][x]; if(v) drawBlockAt(ctx,x,y,COLORS[v]);
    }
  }

  function step(){
    // simple human placeholder: auto-soft drop
    // full human controls in duel would map to player controls on board1
    // AI chooses move
    const move = asterix.bestMove(aiGrid, aiPiece, aiNext, 2);
    if(move){ // apply move simulation: place piece at move.x and rotation
      const sim = simulatePlace(aiGrid, aiPiece, move.x, move.rotation);
      // merge sim.board into aiGrid
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) aiGrid[y][x]=sim.board[y][x];
    }
    // clear lines and redraw
    drawBoard(ctxHuman, humanGrid);
    drawBoard(ctxAI, aiGrid);
  }
  setInterval(step,800);
}

function createMatrix(w,h){
  let m=[]; for(let y=0;y<h;y++){ m[y]=new Array(w).fill(0);} return m;
}

function randomPiece(){
  const k = SHAPE_KEYS[Math.floor(Math.random()*SHAPE_KEYS.length)];
  const shape = SHAPES[k].map(r=>r.slice());
  const id = SHAPE_KEYS.indexOf(k)+1;
  return {key:k,shape, id};
}

function spawnPiece(){
  const p = nextPiece || randomPiece();
  nextPiece = randomPiece();
  p.x = Math.floor(COLS/2) - Math.ceil(p.shape[0].length/2);
  p.y = 0;
  return p;
}

function update(time=0){
  if(!running) return;
  const delta = time - lastTime;
  lastTime = time;
  if(!paused){
    dropCounter += delta;
    if(dropCounter > dropInterval){
      drop();
      dropCounter = 0;
    }
    updateTimer();
  }
  render();
  if(!gameOver) requestAnimationFrame(update);
}

function updateTimer(){
  if(!startTime) return;
  const s = Math.floor((Date.now()-startTime)/1000);
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  timerEl.innerText = `Tempo: ${mm}:${ss}`;
}

function drawBlockAt(cx,x,y,color){
  cx.fillStyle = color;
  cx.fillRect(x*BLOCK+1,y*BLOCK+1,BLOCK-2,BLOCK-2);
  // highlight
  cx.strokeStyle = 'rgba(255,255,255,0.08)';
  cx.strokeRect(x*BLOCK+1,y*BLOCK+1,BLOCK-2,BLOCK-2);
}

function render(){
  // main board
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // draw grid
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){ const v = grid[y][x]; if(v) drawBlockAt(ctx,x,y,COLORS[v]); }
  // draw current
  if(current){
    const s = current.shape;
    for(let y=0;y<s.length;y++) for(let x=0;x<s[y].length;x++) if(s[y][x]) drawBlockAt(ctx,current.x+x,current.y+y,COLORS[current.id]);
  }
  // next
  nctx.clearRect(0,0,nextCanvas.width,nextCanvas.height);
  const s = nextPiece.shape;
  const scale = 20; nctx.save(); nctx.translate(10,10);
  for(let y=0;y<s.length;y++) for(let x=0;x<s[y].length;x++) if(s[y][x]){
    nctx.fillStyle = COLORS[nextPiece.id]; nctx.fillRect(x*scale,y*scale,scale-2,scale-2);
  }
  nctx.restore();
}

function collide(mat, piece){
  for(let y=0;y<piece.shape.length;y++) for(let x=0;x<piece.shape[y].length;x++) if(piece.shape[y][x]){
    const ny = piece.y + y; const nx = piece.x + x;
    if(ny<0) continue;
    if(nx<0 || nx>=COLS || ny>=ROWS) return true;
    if(mat[ny][nx]) return true;
  }
  return false;
}

function merge(mat,piece){
  for(let y=0;y<piece.shape.length;y++) for(let x=0;x<piece.shape[y].length;x++) if(piece.shape[y][x]){
    const ny = piece.y + y; const nx = piece.x + x;
    if(ny>=0 && ny<ROWS && nx>=0 && nx<COLS) mat[ny][nx] = piece.id;
  }
}

function drop(){
  if(!current) current = spawnPiece();
  current.y++;
  if(collide(grid,current)){
    current.y--;
    merge(grid,current);
    const cleared = sweepLines();
    if(cleared>0){
      score += cleared * 100;
      spawnLineClearEffect(cleared);
      spawnStarBurst();
    }
    current = spawnPiece();
    if(collide(grid,current)){
      gameOver = true; running=false; aiStatus.innerText='Game Over';
    }
    updateUI();
  }
}

function softDrop(){ current.y++; if(collide(grid,current)) current.y--; }
function hardDrop(){ while(!collide(grid, current)){ current.y++; } current.y--; merge(grid,current); const cleared = sweepLines(); if(cleared>0){ score += cleared*100; spawnLineClearEffect(cleared); spawnStarBurst(); } current = spawnPiece(); updateUI(); }

function move(dir){ current.x += dir; if(collide(grid,current)) current.x -= dir; }

function rotate(dir){
  const s = current.shape; const prev = s.map(r=>r.slice());
  current.shape = rotateMatrix(s, dir);
  // wall kick simple
  let kicked = false;
  for(let i=0;i<3;i++){
    const dx = (i%2===0? i+1: -(i+1)); current.x += dx;
    if(!collide(grid,current)){ kicked=true; break; }
    current.x -= dx;
  }
  if(!kicked && collide(grid,current)) current.shape = prev;
}

function rotateMatrix(m, dir){
  const n = m.length; let res = Array.from({length:n},()=>Array(n).fill(0));
  for(let y=0;y<n;y++)for(let x=0;x<n;x++) res[x][n-1-y]=m[y][x];
  if(dir<0) for(let i=0;i<3;i++) res = rotateMatrix(res,1);
  return res;
}

function sweepLines(){
  let rowCount=0;
  outer: for(let y=ROWS-1;y>=0;y--){
    for(let x=0;x<COLS;x++) if(!grid[y][x]) continue outer;
    // remove row
    const row = grid.splice(y,1)[0]; grid.unshift(new Array(COLS).fill(0)); y++; rowCount++;
  }
  return rowCount;
}

function updateUI(){ scoreEl.innerText = `Pontuação: ${score}`; }

// Effects: stars and magic
let particles = [];
function spawnStarBurst(){ spawnStars(30); }
function spawnStars(n){
  for(let i=0;i<n;i++) particles.push({x:Math.random()*effectCanvas.width,y:120+Math.random()*200,vx:(Math.random()-0.5)*4,vy:-Math.random()*6-1,age:0,life:80,color:`hsl(${Math.random()*50+40},90%,60%)`});
  animateEffects();
}
function spawnStarRain(n=120){ spawnStarRainInternal(n); }
function spawnStarRainInternal(n){
  for(let i=0;i<n;i++) particles.push({x:Math.random()*effectCanvas.width,y:-Math.random()*200,vx:(Math.random()-0.5)*2,vy:Math.random()*3+1,age:0,life:200,color:`hsl(${Math.random()*360},80%,70%)`});
  animateEffects();
}

function animateEffects(){ if(!effectAnim) effectAnim = requestAnimationFrame(stepEffects); }
let effectAnim = null;
function stepEffects(){ ectx.clearRect(0,0,effectCanvas.width,effectCanvas.height);
  for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.age++; const a = 1 - p.age/p.life; ectx.fillStyle = p.color; ectx.globalAlpha = Math.max(0, a); drawStar(ectx,p.x,p.y,3); if(p.age>p.life) particles.splice(i,1); }
  ectx.globalAlpha=1; if(particles.length>0) effectAnim = requestAnimationFrame(stepEffects); else { cancelAnimationFrame(effectAnim); effectAnim=null; }
}

function drawStar(c,x,y,r){ c.beginPath(); for(let i=0;i<5;i++){ c.lineTo(x+Math.cos((18+i*72)/180*Math.PI)*r, y- Math.sin((18+i*72)/180*Math.PI)*r); c.lineTo(x+Math.cos((54+i*72)/180*Math.PI)*(r/2), y- Math.sin((54+i*72)/180*Math.PI)*(r/2)); } c.closePath(); c.fill(); }

function spawnLineClearEffect(lines){ // small magic effect
  spawnStars(lines*20);
}

// Easter egg: star rain when triple clicking
function spawnStarRain(count=100){ spawnStarRainInternal(count); }

// Utility: simulate placing for duel
function simulatePlace(mat, piece, targetX, rotation){
  // clone
  const board = mat.map(r=>r.slice());
  let p = {shape: rotateTimes(piece.shape, rotation), id: piece.id, x: targetX, y:0};
  while(!collide(board,p)) p.y++;
  p.y--;
  merge(board,p);
  // sweep
  let cleared = 0;
  outer: for(let y=ROWS-1;y>=0;y--){ for(let x=0;x<COLS;x++) if(!board[y][x]) continue outer; board.splice(y,1); board.unshift(new Array(COLS).fill(0)); cleared++; y++; }
  return {board, cleared};
}
function rotateTimes(shape, times){ let s = shape.map(r=>r.slice()); for(let i=0;i<times;i++) s = rotateMatrixSquare(s); return s; }
function rotateMatrixSquare(m){ const n = m.length; let res = Array.from({length:n},()=>Array(n).fill(0)); for(let y=0;y<n;y++)for(let x=0;x<n;x++) res[x][n-1-y]=m[y][x]; return res; }

// rudimentary hard drop utility (used by AI)
function getDropY(board, piece, x){ let p = {shape: piece.shape, id: piece.id, x, y:0}; while(!collide(board,p)) p.y++; return p.y-1; }

// Demo: simple star rain on start
function demo(){ spawnStars(10); }

demo();
