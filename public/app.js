// Single-file React app converted from TypeScript sources in ttc/src
// Assumes React and ReactDOM are loaded globally via CDN before this script.

(function() {
  const { useState, useLayoutEffect } = React;

  function TicTacToeSVG(props) {
    const size = props.size;
    const [board, setBoard] = useState([
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ]);
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [winningLine, setWinningLine] = useState(null);
    const [isSinglePlayer, setIsSinglePlayer] = useState(false);
    const [isAIThinking, setIsAIThinking] = useState(false);

    const cellSize = size / 3;
    const padding = cellSize * 0.1;
    const lineWidth = 4;

    const winningCombinations = [
      [[0,0],[0,1],[0,2]],
      [[1,0],[1,1],[1,2]],
      [[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]],
      [[0,1],[1,1],[2,1]],
      [[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]],
      [[0,2],[1,1],[2,0]]
    ];

    function checkWinner(newBoard) {
      for (const combination of winningCombinations) {
        const [a,b,c] = combination;
        if (newBoard[a[0]][a[1]] && newBoard[a[0]][a[1]] === newBoard[b[0]][b[1]] && newBoard[a[0]][a[1]] === newBoard[c[0]][c[1]]) {
          return { winner: newBoard[a[0]][a[1]], combination };
        }
      }
      const moves = newBoard.flat().filter(cell => cell !== '').length;
      return { winner: moves === 9 ? 'Draw' : null, combination: null };
    }

    function minimax(boardState, depth, isMaximizing) {
      const result = checkWinner(boardState);
      if (result.winner === 'O') return 10 - depth;
      if (result.winner === 'X') return depth - 10;
      if (result.winner === 'Draw') return 0;

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i=0;i<3;i++) {
          for (let j=0;j<3;j++) {
            if (boardState[i][j] === '') {
              boardState[i][j] = 'O';
              const score = minimax(boardState, depth+1, false);
              boardState[i][j] = '';
              bestScore = Math.max(score, bestScore);
            }
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i=0;i<3;i++) {
          for (let j=0;j<3;j++) {
            if (boardState[i][j] === '') {
              boardState[i][j] = 'X';
              const score = minimax(boardState, depth+1, true);
              boardState[i][j] = '';
              bestScore = Math.min(score, bestScore);
            }
          }
        }
        return bestScore;
      }
    }

    function getBestMove(boardState) {
      let bestScore = -Infinity;
      let bestMove = { row: 0, col: 0 };
      for (let i=0;i<3;i++) {
        for (let j=0;j<3;j++) {
          if (boardState[i][j] === '') {
            boardState[i][j] = 'O';
            const score = minimax(boardState, 0, false);
            boardState[i][j] = '';
            if (score > bestScore) { bestScore = score; bestMove = { row: i, col: j }; }
          }
        }
      }
      return bestMove;
    }

    function makeAIMove(currentBoard) {
      setIsAIThinking(true);
      setTimeout(() => {
        const bestMove = getBestMove(currentBoard);
        const newBoard = currentBoard.map(r => r.slice());
        newBoard[bestMove.row][bestMove.col] = 'O';
        setBoard(newBoard);
        setIsAIThinking(false);
        const gameResult = checkWinner(newBoard);
        if (gameResult.winner) {
          setGameOver(true);
            setWinner(gameResult.winner);
            if (gameResult.combination) setWinningLine(gameResult.combination);
            setTimeout(() => {
              alert(gameResult.winner === 'Draw' ? "It's a draw!" : gameResult.winner + ' wins!');
              resetGame();
            }, 1000);
        } else {
          setCurrentPlayer('X');
        }
      }, 500);
    }

    function handleClick(row, col) {
      if (gameOver || board[row][col] || isAIThinking) return;
      if (isSinglePlayer && currentPlayer === 'O') return;
      const newBoard = board.map(r => r.slice());
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      const gameResult = checkWinner(newBoard);
      if (gameResult.winner) {
        setGameOver(true);
        setWinner(gameResult.winner);
        if (gameResult.combination) setWinningLine(gameResult.combination);
        setTimeout(() => {
          alert(gameResult.winner === 'Draw' ? "It's a draw!" : gameResult.winner + ' wins!');
          resetGame();
        }, 1000);
      } else {
        if (isSinglePlayer && currentPlayer === 'X') {
          setCurrentPlayer('O');
          makeAIMove(newBoard);
        } else {
          setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        }
      }
    }

    function resetGame() {
      setBoard([
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ]);
      setCurrentPlayer('X');
      setGameOver(false);
      setWinner(null);
      setWinningLine(null);
      setIsAIThinking(false);
    }

    function toggleGameMode() { setIsSinglePlayer(!isSinglePlayer); resetGame(); }

    function getCellCenter(row, col) {
      return { x: col * cellSize + cellSize/2, y: row * cellSize + cellSize/2 };
    }

    return React.createElement('div', { style: { display:'flex', flexDirection:'column', alignItems:'center', gap:'15px' }},
      React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.1)', padding:'8px 16px', borderRadius:'20px', backdropFilter:'blur(10px)' }},
        React.createElement('span', { style:{ color:'white', fontSize:'14px', fontWeight:500 }}, isSinglePlayer ? 'Single Player' : 'Multiplayer'),
        React.createElement('button', { onClick: toggleGameMode, style: { background: isSinglePlayer ? '#4CAF50' : '#2196F3', color:'#fff', border:'none', padding:'6px 12px', borderRadius:'15px', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all 0.2s ease' }}, 'Switch to ' + (isSinglePlayer ? 'Multiplayer' : 'Single Player'))
      ),
      React.createElement('div', { style:{ color:'white', fontSize:'16px', fontWeight:500, textAlign:'center', minHeight:'20px' }},
        gameOver ? (winner === 'Draw' ? "It's a draw!" : winner + ' wins!') : (isAIThinking ? 'AI is thinking...' : (isSinglePlayer ? (currentPlayer === 'X' ? 'Your turn (X)' : 'AI turn (O)') : ('Player ' + currentPlayer + "'s turn")))
      ),
      (function(){
        const children = [];
        // Build SVG manually using createElement
        const svgChildren = [];
        svgChildren.push(React.createElement('defs', { key: 'defs' },
          React.createElement('filter', { id:'shadow', x:'-50%', y:'-50%', width:'200%', height:'200%' },
            React.createElement('feDropShadow', { dx:'3', dy:'3', stdDeviation:'3', floodColor:'#000000', floodOpacity:'0.15' })
          )
        ));
        // Grid lines
        const gridLines = [
          ['line',{ x1:cellSize, y1:padding, x2:cellSize, y2:size - padding }],
          ['line',{ x1:cellSize*2, y1:padding, x2:cellSize*2, y2:size - padding }],
          ['line',{ x1:padding, y1:cellSize, x2:size - padding, y2:cellSize }],
          ['line',{ x1:padding, y1:cellSize*2, x2:size - padding, y2:cellSize*2 }]
        ];
        svgChildren.push(React.createElement('g', { key:'grid', stroke:'#a0aec0', strokeWidth:lineWidth, strokeLinecap:'round' },
          gridLines.map((l,i)=>React.createElement(l[0], { key:i, ...l[1] }))
        ));
        // Cells + pieces
        board.forEach((row,rowIndex)=>{
          row.forEach((cell,colIndex)=>{
            const centerX = colIndex * cellSize + cellSize/2;
            const centerY = rowIndex * cellSize + cellSize/2;
            const pieceSize = cellSize * 0.3;
            const strokeWidth = 8;
            const gChildren = [
              React.createElement('rect', { key:'rect', x:colIndex*cellSize, y:rowIndex*cellSize, width:cellSize, height:cellSize, fill:'transparent', style:{ cursor: (gameOver || cell) ? 'default' : 'pointer' } })
            ];
            if (cell === 'X') {
              gChildren.push(React.createElement('g', { key:'x', filter:'url(#shadow)', stroke:'#e53e3e', strokeWidth:strokeWidth, strokeLinecap:'round' },
                React.createElement('line', { x1:centerX - pieceSize, y1:centerY - pieceSize, x2:centerX + pieceSize, y2:centerY + pieceSize }),
                React.createElement('line', { x1:centerX + pieceSize, y1:centerY - pieceSize, x2:centerX - pieceSize, y2:centerY + pieceSize })
              ));
            } else if (cell === 'O') {
              gChildren.push(React.createElement('circle', { key:'o', cx:centerX, cy:centerY, r:pieceSize, fill:'none', stroke:'#3182ce', strokeWidth:strokeWidth, filter:'url(#shadow)' }));
            }
            svgChildren.push(React.createElement('g', { key:`cell-${rowIndex}-${colIndex}`, onClick: () => handleClick(rowIndex, colIndex) }, gChildren));
          });
        });
        if (winningLine) {
          svgChildren.push(React.createElement('line', { key:'win', x1:getCellCenter(winningLine[0][0], winningLine[0][1]).x, y1:getCellCenter(winningLine[0][0], winningLine[0][1]).y, x2:getCellCenter(winningLine[2][0], winningLine[2][1]).x, y2:getCellCenter(winningLine[2][0], winningLine[2][1]).y, stroke:'#2f3b4c', strokeWidth:10, strokeLinecap:'round', filter:'url(#shadow)' }));
        }
        return React.createElement('svg', { width:size, height:size, viewBox:`0 0 ${size} ${size}`, style:{ background:'#f0f4f8', cursor: isAIThinking ? 'wait' : 'pointer', display:'block' } }, svgChildren);
      })()
    );
  }

  function App() {
    const [size, setSize] = useState(300);
    useLayoutEffect(() => {
      function updateSize() {
        const maxSize = Math.min(window.innerWidth * 0.4, window.innerHeight * 0.4, 300);
        const newSize = Math.max(250, maxSize);
        setSize(newSize);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);

    return React.createElement('div', { className: 'app' },
      React.createElement('h1', { className: 'game-title' }, 'TIC TAC TOE'),
      React.createElement(TicTacToeSVG, { size }),
      React.createElement('div', { className: 'game-info' }, 'Click a square to play • First to get 3 in a row wins!')
    );
  }

  // Mount
  document.addEventListener('DOMContentLoaded', function() {
    const rootEl = document.getElementById('root');
    if (!rootEl) return;
    const root = ReactDOM.createRoot(rootEl);
    root.render(React.createElement(React.StrictMode, null, React.createElement(App)));
  });
})();
