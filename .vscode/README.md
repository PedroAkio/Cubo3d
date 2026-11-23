# Cubo Mágico 3D

Projeto interativo de um cubo mágico 3×3×3 desenvolvido com Three.js.

## Como executar
1. Extraia o ZIP.
2. Abra a pasta em um editor, como VS Code.
3. Inicie um servidor local (por exemplo, a extensão **Live Server**).
4. Abra `index.html` pelo endereço local fornecido pelo servidor.

> O projeto importa Three.js e OrbitControls por CDN, então precisa de conexão com a internet.

## Controles
- Mouse: arrastar para orbitar a câmera; scroll para zoom.
- Botões U, D, L, R, F e B: girar cada uma das seis faces.
- Teclado U, D, L, R, F e B: mesmos movimentos.
- Shift + tecla: sentido inverso.
- Embaralhar: executa uma sequência animada de 20 movimentos.
- Reiniciar: retorna o cubo ao estado resolvido.
- Tema de cores: clássico, pastel ou neon.

## Estrutura
- `index.html`: interface e importação dos módulos.
- `style.css`: layout e aparência.
- `script.js`: cena 3D, cubinhos, câmera, controles e animações.
