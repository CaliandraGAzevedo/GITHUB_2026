// ai.js - Asterix: agente IA baseado em minimax (profundidade limitada) com heurísticas

class Asterix {
  constructor(){
    this.assist = true; // modo de assistência (dupla)
  }
  toggleAssist(){ this.assist = !this.assist; }

  // Retorna melhor movimento: {x, rotation}
  bestMove(board, piece, nextPiece, depth=2){
    // generate all placements for piece
    const moves = this.generateMoves(board, piece);
    if(moves.length===0) return null;
    let best = null; let bestScore = -Infinity;
    for(const m of moves){
      const sim = this.applyMove(board, piece, m.x, m.rotation);
      const score = this.minimax(sim.board, nextPiece, depth-1, false, -Infinity, Infinity);
      if(score>bestScore){ bestScore=score; best=m; }
    }
    return best;
  }

  // minimax with simple opponent/randomness modeled as exploring next piece moves
  minimax(board, piece, depth, isMax, alpha, beta){
    if(depth<=0 || !piece) return this.evaluate(board);
    const moves = this.generateMoves(board, piece);
    if(isMax){ // maximize
      let v = -Infinity;
      for(const m of moves){ const s = this.applyMove(board,piece,m.x,m.rotation); v = Math.max(v, this.minimax(s.board, this.randomPiece(), depth-1, false, alpha, beta)); alpha = Math.max(alpha, v); if(beta<=alpha) break; }
      return v===-Infinity? this.evaluate(board): v;
    } else { // minimize / chance -> average over moves (approx)
      let total = 0; let count=0;
      for(const m of moves){ const s = this.applyMove(board,piece,m.x,m.rotation); total += this.minimax(s.board, this.randomPiece(), depth-1, true, alpha, beta); count++; }
      return count===0? this.evaluate(board): total/count;
    }
  }

  generateMoves(board, piece){
    const w = board[0].length; const results=[];
    const rotations = this.uniqueRotations(piece.shape);
    for(let r=0;r<rotations.length;r++){
      const shape = rotations[r];
      const width = shape[0].length;
      for(let x=-2;x<=w;x++){
        // simulate drop
        const p = {shape, id: piece.id, x, y:0};
        if(this.collide(board,p)) continue;
        while(!this.collide(board,p)) p.y++;
        p.y--;
        if(p.y<0) continue;
        results.push({x, rotation:r});
      }
    }
    return results;
  }

  applyMove(board, piece, x, rotation){
    const clone = board.map(r=>r.slice());
    const shape = this.rotateTimes(piece.shape, rotation);
    const p = {shape, id: piece.id, x, y:0};
    while(!this.collide(clone,p)) p.y++; p.y--;
    // merge
    for(let y=0;y<p.shape.length;y++) for(let xi=0;xi<p.shape[y].length;xi++) if(p.shape[y][xi]){
      const bx = p.x+xi, by=p.y+y; if(by>=0 && bx>=0 && bx<clone[0].length) clone[by][bx]=p.id;
    }
    // sweep
    for(let y=clone.length-1;y>=0;y--){ if(clone[y].every(v=>v)) { clone.splice(y,1); clone.unshift(new Array(clone[0].length).fill(0)); y++; } }
    return {board:clone};
  }

  evaluate(board){
    // heurística clássica: linhas limpas, agregate height, holes, bumpiness
    const heights = []; let holes=0, agg=0;
    const w = board[0].length, h=board.length;
    for(let x=0;x<w;x++){
      let colh=0;
      for(let y=0;y<h;y++){ if(board[y][x]){ colh = h-y; break; } }
      heights.push(colh);
      agg += colh;
      // count holes
      let found=false;
      for(let y=0;y<h;y++){
        if(board[y][x]) found=true;
        else if(found && !board[y][x]) holes++;
      }
    }
    let bump=0;
    for(let i=0;i<heights.length-1;i++) bump += Math.abs(heights[i]-heights[i+1]);
    // lines
    let complete=0; for(let y=0;y<h;y++) if(board[y].every(v=>v)) complete++;
    // Score components
    const score = complete*1000 - agg*4 - holes*450 - bump*3;
    return score;
  }

  // helpers
  rotateTimes(shape, times){ let s = shape.map(r=>r.slice()); for(let i=0;i<times;i++) s=this.rotateMatrixSquare(s); return s; }
  rotateMatrixSquare(m){ const n=m.length; let res=Array.from({length:n},()=>Array(n).fill(0)); for(let y=0;y<n;y++)for(let x=0;x<n;x++) res[x][n-1-y]=m[y][x]; return res; }
  uniqueRotations(shape){ const set=[]; let s = shape.map(r=>r.slice()); for(let i=0;i<4;i++){ const key = JSON.stringify(s); if(!set.some(x=>JSON.stringify(x)===key)) set.push(s.map(r=>r.slice())); s=this.rotateMatrixSquare(s); } return set; }
  collide(board,piece){ for(let y=0;y<piece.shape.length;y++) for(let x=0;x<piece.shape[y].length;x++) if(piece.shape[y][x]){ const ny=piece.y+y; const nx=piece.x+x; if(nx<0||nx>=board[0].length||ny>=board.length) return true; if(ny>=0 && board[ny][nx]) return true;} return false; }
  randomPiece(){
    const keys = Object.keys({I:1,J:1,L:1,O:1,S:1,T:1,Z:1});
    const k = keys[Math.floor(Math.random()*keys.length)];
    // a minimal shape map (match game.js shapes coordinates not necessary for entire AI randomness)
    const shapes = {
      I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      J:[[1,0,0],[1,1,1],[0,0,0]],
      L:[[0,0,1],[1,1,1],[0,0,0]],
      O:[[1,1],[1,1]],
      S:[[0,1,1],[1,1,0],[0,0,0]],
      T:[[0,1,0],[1,1,1],[0,0,0]],
      Z:[[1,1,0],[0,1,1],[0,0,0]]
    };
    const id = Object.keys(shapes).indexOf(k)+1;
    return {key:k,shape:shapes[k].map(r=>r.slice()),id};
  }
}

// Expose Asterix to the window
window.Asterix = Asterix;
