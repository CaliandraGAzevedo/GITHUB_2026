Arquitetura e processo

Objetivo: suportar modos Solo, Duelo (Humano vs IA) e Dupla (Humano + IA) com um motor de jogo comum e um agente IA (Asterix) que pode tanto competir quanto cooperar.

Componentes principais

1) Interface (UI)
- index.html + style.css
- Canvas de renderização principal, canvas para pré-visualizar peça next, camada de efeitos (overlay canvas)
- Elementos de controle (start/pause/mode), placar e timer

2) Motor do Jogo (Game Engine)
- Representa o tabuleiro como matriz ROWS x COLS
- Responsável por spawn, movimento, rotação, colisão, união (merge) e remoção de linhas
- Gere eventos: lineCleared, pieceLocked, gameOver
- Mantém estado: score, tempo, nível, velocidade (dropInterval)

3) Renderizador
- Desenha blocos no canvas (cores, destaques)
- Gerencia camadas: tabuleiro, next piece, efeitos (partículas)

4) Sistema de Efeitos / Easter Eggs
- Partículas gerando estrelas e efeitos de magia quando linhas são limpas
- Evento especial: triple-click no título -> rain of stars

5) Agente Asterix (AI)
- Implementado em ai.js
- Algoritmo: minimax com profundidade limitada + heurística (linhas, altura agregada, buracos, bumpiness)
- Modo Duelo: joga numa instância separada como adversário
- Modo Dupla: se assist=ON, a IA sugere/aplica jogadas no mesmo tabuleiro (assistência)

6) Modo Duelo / Dupla
- Duelo: duas instâncias do motor (player vs Asterix). Cada instância cuida do seu tabuleiro; limpar linhas pode enviar "garbage" ao adversário (extensão futura)
- Dupla: um tabuleiro compartilhado com controles humanos e modos de assistência da IA

7) Persistência e publicação
- Placar mantido em memória (pode ser estendido com localStorage ou backend)
- Publicação sugerida: GitHub Pages (habilitar Pages em Settings)

Fluxo (exemplo Duelo)
- Usuário inicia modo Duelo → UI cria duas instâncias do motor
- Jogador controla Tabuleiro A; Asterix controla Tabuleiro B
- Ao limpar linhas, cada instância publica eventos (linesCleared)
- Eventos podem ser convertidos em garbage (linhas extras) e aplicados ao oponente

Considerações para evolução
- Separar a lógica do motor em classes (GameInstance) para facilitar múltiplas instâncias
- IA: usar expectimax e modelar a distribuição real de peças (7-bag)
- Multiplayer: adicionar servidor (WebSocket) que sincronize estados
- Adicionar som e configuração de dificuldade

Diagrama (texto)

[UI/Inputs] ---> [Game Controller] ---> [Game Engine] ---> [Board State] ---> [Renderer]
                                      |                             |
                                      v                             v
                                  [Asterix AI]                 [Effects Engine]


Deploy
- Para publicar no servidor, a maneira mais simples é usar GitHub Pages:
  - Vá em Settings → Pages → Source → Branch: main → / (root) → Save
  - Aguarde e acesse: https://CaliandraGAzevedo.github.io/GITHUB_2026/

