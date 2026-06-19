// ai_improved.js - AsterixV2: 7-bag generator + expectimax-like search with time limit

class Bag7{
  constructor(){ this.reset(); }
  reset(){ this.bag = ['I','J','L','O','S','T','Z'].slice(); this.shuffle(); }
  shuffle(){ for(let i=this.bag.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];} }
  next(){ if(this.bag.length===0) this.reset(); return this.bag.pop(); }
}

const SHAPES_MAP = {
  I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J:[[1,0,0],[1,1,1],[0,0,0]],
  L:[[0,0,1],[1,1,1],[0,0,0]],
  O:[[1,1],[1,1]],
  S:[[0,1,1],[1,1,0],[0,0,0]],
  T:[[0,1,0],[1,1,1],[0,0,0]],
  Z:[[1,1,0],[0,1,1],[0,0,0]]
};

class AsterixV2{
  constructor({depth=3, timeLimitMs=200} = {}){ this.depth = depth; this.timeLimitMs = timeLimitMs; }

  bestMove(board, piece, nextPiece){ // wrapper to maintain API compatibility
    return this.searchBest(board,piece,this.depth,this.timeLimitMs);
  }

  searchBest(board,piece,depth,timeLimitMs){ const start=Date.now(); const moves = this.generateMoves(board,piece); if(moves.length===0) return null; let best=null, bestScore=-Infinity; for(const m of moves){ const sim = this.applyMove(board,piece,m.x,m.rotation); const score = this.expectimax(sim.board, depth-1, start, timeLimitMs); if(score>bestScore){ bestScore=score; best=m;} if(Date.now()-start>timeLimitMs) break; } return best; }

  expectimax(board,depth,start,timeLimitMs){ if(depth<=0 || Date.now()-start>timeLimitMs) return this.evaluate(board); // approximate expectation by sampling a few next pieces
    const samples = ['I','J','L','O','S','T','Z']; let total=0; let count=0; for(let k=0;k<samples.length;k++){ const piece = this.shapeFromKey(samples[k]); const moves = this.generateMoves(board,piece); if(moves.length===0) { total+=this.evaluate(board); count++; continue; } // pick best move for that piece
      let best=-Infinity; for(const m of moves){ const sim = this.applyMove(board,piece,m.x,m.rotation); const v = this.expectimax(sim.board, depth-1, start, timeLimitMs); if(v>best) best=v; }
      total+=best; count++; if(Date.now()-start>timeLimitMs) break; }
    return count===0? this.evaluate(board) : total/count; }

  generateMoves(board,piece){ const w=board[0].length; const results=[]; const rotations=this.uniqueRotations(piece.shape); for(let r=0;r<rotations.length;r++){ const shape=rotations[r]; for(let x=-2;x<w;x++){ const p={shape,id:piece.id,x,y:0}; p.shape=shape; if(this.collide(board,p)) continue; while(!this.collide(board,p)) p.y++; p.y--; if(p.y<0) continue; results.push({x,rotation:r}); } } return results; }

  applyMove(board,piece,x,rotation){ const clone = board.map(r=>r.slice()); const shape = this.rotateTimes(piece.shape, rotation); const p={shape,id:piece.id,x,y:0}; while(!this.collide(clone,p)) p.y++; p.y--; for(let y=0;y<p.shape.length;y++) for(let xi=0;xi<p.shape[y].length;xi++) if(p.shape[y][xi]){ const bx=p.x+xi, by=p.y+y; if(by>=0 && bx>=0 && bx<clone[0].length) clone[by][bx]=p.id; } for(let y=clone.length-1;y>=0;y--){ if(clone[y].every(v=>v)){ clone.splice(y,1); clone.unshift(new Array(clone[0].length).fill(0)); y++; } } return {board:clone}; }

  // heuristics
  evaluate(board){ const w=board[0].length,h=board.length; let agg=0,holes=0,bump=0,complete=0; const heights=[]; for(let x=0;x<w;x++){ let colh=0; for(let y=0;y<h;y++){ if(board[y][x]){ colh = h - y; break; } } heights.push(colh); agg+=colh; let found=false; for(let y=0;y<h;y++){ if(board[y][x]) found=true; else if(found && !board[y][x]) holes++; } } for(let i=0;i<heights.length-1;i++) bump+=Math.abs(heights[i]-heights[i+1]); for(let y=0;y<h;y++) if(board[y].every(v=>v)) complete++; // tuned weights
    return complete*1200 - agg*7 - holes*1000 - bump*4; }

  // helpers
  rotateTimes(shape,times){ let s=shape.map(r=>r.slice()); for(let i=0;i<times;i++) s=this.rotateMatrixSquare(s); return s; }
  rotateMatrixSquare(m){ const n=m.length; let res=Array.from({length:n},()=>Array(n).fill(0)); for(let y=0;y<n;y++)for(let x=0;x<n;x++) res[x][n-1-y]=m[y][x]; return res; }
  uniqueRotations(shape){ const set=[]; let s=shape.map(r=>r.slice()); for(let i=0;i<4;i++){ const key=JSON.stringify(s); if(!set.some(x=>JSON.stringify(x)===key)) set.push(s.map(r=>r.slice())); s=this.rotateMatrixSquare(s); } return set; }
  collide(board,piece){ for(let y=0;y<piece.shape.length;y++) for(let x=0;x<piece.shape[y].length;x++) if(piece.shape[y][x]){ const ny=piece.y+y, nx=piece.x+x; if(nx<0||nx>=board[0].length||ny>=board.length) return true; if(ny>=0 && board[ny][nx]) return true; } return false; }
  shapeFromKey(k){ return {key:k,shape:SHAPES_MAP[k].map(r=>r.slice()),id:Object.keys(SHAPES_MAP).indexOf(k)+1}; }
}

window.AsterixV2 = AsterixV2;
