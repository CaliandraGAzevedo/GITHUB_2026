# Tetrix

Jogo Tetrix (versão de treinamento) — implementado em HTML/CSS/JS.

Funcionalidades:
- Motor do jogo: queda de peças, rotação, colisão, remoção de linhas.
- Peças coloridas e efeito "estrelas e magia" quando uma linha é completada.
- Agente IA "Asterix" baseado em minimax heurístico (profundidade limitada) para jogar automaticamente ou ajudar o jogador.
- Modos: Solo, Duelo (Humano vs IA), Dupla (Humano + IA cooperativo/assistente).
- Controles visuais: placar, tempo de jogo, status da IA.
- Easter egg: clique 3x no nome do jogo para chover estrelas.

Arquivos adicionados:
- index.html — UI e canvas
- style.css — estilos
- game.js — motor do jogo + efeitos
- ai.js — agente Asterix (minimax heurístico)
- README.md — este arquivo

Como executar localmente:
1. Abra `index.html` em um navegador moderno (Chrome/Edge/Firefox).
2. Use os controles: ← → rotacionar, ↑, ↓, espaço, P para pausar.

Publicar (servidor/GitHub Pages):
1. Este repositório já contém os arquivos do jogo.
2. Vá em Settings → Pages e aponte a source para a branch `main` (root). Aguarde alguns minutos.
3. O site ficará disponível em: `https://<seu-usuario>.github.io/GITHUB_2026/` (ex.: https://CaliandraGAzevedo.github.io/GITHUB_2026/)

Observações e próximos passos:
- A IA é um agente simplificado para demonstração; pode ser melhorada trocando minimax por expectimax e usando bag de peças realista.
- Para multiplayer online, é preciso adicionar sincronização por WebSocket/servidor.
- Refatorar para classes e dividir instâncias de jogo melhorará manutenção.

