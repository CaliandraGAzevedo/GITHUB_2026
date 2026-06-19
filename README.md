# 🎮 Tetrix - Jogo de Treinamento

Jogo Tetrix implementado em **HTML/CSS/JavaScript** com motor de jogo completo, IA inteligente e múltiplos modos de jogo.

## ✨ Funcionalidades

### Motor do Jogo
- ✅ Queda dinâmica de peças coloridas
- ✅ Sistema de rotação (com validação de colisão)
- ✅ Detecção de colisão e integração ao tabuleiro
- ✅ Remoção automática de linhas completas
- ✅ Placar e cronômetro em tempo real
- ✅ Efeito visual "estrelas e magia" ao completar linhas
- ✅ Easter egg: clique 3x no título para chover estrelas

### Agente IA "Asterix"
- 🤖 IA baseada em **minimax heurístico** (versão v1)
- 🤖 **AsterixV2** com 7-bag de peças + expectimax aproximado (versão v2 refatorada)
- Profundidade configurável e limite de tempo por busca
- Suporta assistência em tempo real ao jogador

### Modos de Jogo
1. **Solo** — Jogue contra você mesmo
2. **Duelo** — Humano vs IA (quem faz mais pontos)
3. **Dupla** — Humano + IA cooperativo (IA auxilia com sugestões)

### Versões
- **v1 (original)** — Motor simples e funcional, IA básica
- **v2 (refatorada)** — GameInstance class, IA melhorada, sistema de som via WebAudio

## 🎯 Como Jogar

### Executar Localmente
1. Clone ou faça download do repositório
2. Abra um dos arquivos em navegador moderno:
   - **v1**: `index.html`
   - **v2**: `tetrix_v2/index.html`
3. Clique em **Iniciar** para começar

### Controles
| Controle | Ação |
|----------|------|
| ← → | Mover peça esquerda/direita |
| ↑ | Rotacionar peça |
| ↓ | Soft drop (queda lenta) |
| Espaço | Hard drop (queda rápida) |
| P | Pausar/Retomar |
| H | Alternar assistência IA (v2) |

## 📦 Estrutura de Arquivos

### Versão v1 (raiz)
```
├── index.html          # UI e canvas principal
├── style.css           # Estilos do jogo
├── game.js             # Motor do jogo + efeitos
├── ai.js               # Agente IA Asterix (minimax)
└── README.md           # Documentação
```

### Versão v2 (pasta tetrix_v2/)
```
tetrix_v2/
├── index.html              # UI v2
├── style.css               # Estilos v2
├── game_instance.js        # GameInstance class (motor refatorado)
├── ai_improved.js          # AsterixV2 (7-bag + expectimax)
├── sound.js                # SoundEngine (WebAudio)
└── README.md               # Documentação v2
```

## 🚀 Publicar no GitHub Pages

Seu repositório já tem GitHub Pages configurado! O jogo está disponível em:

```
https://CaliandraGAzevedo.github.io/GITHUB_2026/
```

**Versão v1**: https://CaliandraGAzevedo.github.io/GITHUB_2026/
**Versão v2**: https://CaliandraGAzevedo.github.io/GITHUB_2026/tetrix_v2/

Se Pages não estiver ativo:
1. Vá em **Settings** → **Pages**
2. Selecione **Source: main branch (root)**
3. Aguarde 1-2 minutos para build completar

## 🔧 Detalhes Técnicos

### Versão v1
- **Renderização**: Canvas 2D com 24px por bloco
- **Grid**: 10 colunas × 20 linhas
- **Peças**: I, J, L, O, S, T, Z (padrão Tetris)
- **IA**: Minimax com profundidade limitada

### Versão v2 (Refatorada)
- **Arquitetura**: GameInstance class encapsula estado, lógica e render
- **IA Melhorada**: 
  - Gerador 7-bag realista
  - Expectimax aproximado com limite de tempo
  - Profundidade configurável
- **Som**: WebAudio API (sem dependências externas)
- **Escalabilidade**: Preparado para múltiplas instâncias simultâneas

## 📈 Próximos Passos

- [ ] Persistência de placar (localStorage)
- [ ] Níveis de dificuldade configuráveis
- [ ] Duelo em tempo real (múltiplas instâncias ativas)
- [ ] Integração multiplayer online (WebSocket)
- [ ] Animações de transição melhoradas
- [ ] Sistema de achievements

## 📝 Notas

- A IA é um agente educacional para demonstração
- Pode ser melhorada com algoritmos mais avançados (alpha-beta pruning, MCTS)
- Para multiplayer online, adicione sincronização servidor-cliente

---

**Status**: ✅ Pronto para jogar e publicar
**Último update**: 2026-06-19
**Linguagem**: JavaScript + HTML5 Canvas + CSS3
