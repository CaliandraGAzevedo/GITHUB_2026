// sound.js - simple WebAudio-based sounds (no external files)

class SoundEngine{
  constructor(){ this.ctx = null; try{ window.AudioContext = window.AudioContext || window.webkitAudioContext; this.ctx = new AudioContext(); }catch(e){ this.ctx=null; }
  }
  play(type){ if(!this.ctx) return; const now = this.ctx.currentTime; if(type==='line'){ this.beep(now,200,0.12,0.2); this.beep(now+0.06,300,0.08,0.14); } else if(type==='drop'){ this.beep(now,120,0.08,0.06); } else if(type==='gameover'){ this.beep(now,80,0.25,0.5); } else if(type==='star'){ this.chime(now); } else if(type==='star-rain'){ for(let i=0;i<6;i++) this.chime(now + i*0.03); }
  }
  beep(start,freq,vol,dur){ const o = this.ctx.createOscillator(); const g = this.ctx.createGain(); o.type='sine'; o.frequency.value=freq; g.gain.setValueAtTime(vol, start); g.gain.exponentialRampToValueAtTime(0.001, start+dur); o.connect(g); g.connect(this.ctx.destination); o.start(start); o.stop(start+dur+0.02); }
  chime(start){ const o1=this.ctx.createOscillator(); const o2=this.ctx.createOscillator(); const g=this.ctx.createGain(); o1.type='sine'; o2.type='triangle'; o1.frequency.value=800; o2.frequency.value=1200; g.gain.setValueAtTime(0.06,start); g.gain.exponentialRampToValueAtTime(0.001,start+0.18); const mix=this.ctx.createGain(); o1.connect(mix); o2.connect(mix); mix.connect(g); g.connect(this.ctx.destination); o1.start(start); o2.start(start); o1.stop(start+0.2); o2.stop(start+0.2); }
}

window.SoundEngine = SoundEngine;
