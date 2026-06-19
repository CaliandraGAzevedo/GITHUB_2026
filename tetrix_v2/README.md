# Tetrix v2 (refatorado)

Esta pasta contém a versão refatorada do Tetrix sem sobrescrever a versão anterior.

Novidades:
- Motor refatorado: GameInstance class (game_instance.js) que encapsula o estado do jogo, render e efeitos.
- IA melhorada: AsterixV2 (ai_improved.js) com gerador 7-bag e expectimax aproximado, profundidade configurável e limite de tempo por busca.
- Som: SoundEngine (sound.js) usa WebAudio para efeitos (linha, drop, gameover, estrelas) sem arquivos externos.

Como usar:
- Abra tetrix_v2/index.html em um navegador moderno.
- Controles: ← → mover | ↑ rotacionar | ↓ soft drop | Espaço hard drop | P pausar | H alterna assistência IA

Próximos passos sugeridos:
- Refatorar GameInstance para suportar múltiplas instâncias simultâneas (duelo real).
- Adicionar persistência de placar (localStorage) e opções de dificuldade.
- Integrar IA em modo Duelo e Dupla com comunicação clara entre instâncias.

