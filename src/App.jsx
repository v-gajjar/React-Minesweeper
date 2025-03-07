import { useState, useEffect } from "react";

import GameStatus from "./enum/GameStatus";
import { GAME_DIFFICULTY_LEVEL_SETTINGS } from "./config/gameDifficultyLevelSettings";

import GameDifficultySelector from "./components/GameDifficultySelector";
import GameBoard from "./components/GameBoard";
import GameResultModal from "./components/GameResultModal";
import RemainingFlagsCounter from "./components/RemainingFlagsCounter";

import "./App.css";


function App() {
  const [board, setBoard] = useState([]);
  const [gameStatus, setGameStatus] = useState(GameStatus.GAME_NOT_STARTED);
  const [remainingFlagsCount, setRemainingFlagsCount] = useState(0);
  const [minesHaveBeenAssigned, setMinesHaveBeenAssigned] = useState(false);
  const [safeTilesCount, setSafeTilesCount] = useState(0);
  const [mineLocations, setMineLocations] = useState([]);
  const [flagLocations, setFlagLocations] = useState([]);
 
  const [gameDifficultySettings, setGameDifficultySettings] = useState(GAME_DIFFICULTY_LEVEL_SETTINGS.EASY);

  useEffect(() => {
    if (gameHasEnded()) {
      const gameResultModal = document.getElementById("gameResultModal");
      gameResultModal.showModal();
    }
  }, [gameStatus]);

  useEffect(() => {

    generateBoard();
  }, [gameDifficultySettings]);

  const onGameDifficultyLevelChanged = (event) => {
    const selectedLevel = event.target.value;

    const difficultyLevel = Object.values(GAME_DIFFICULTY_LEVEL_SETTINGS).find(
      (difficultySetting) => selectedLevel === difficultySetting.level
    );

    if (! difficultyLevel) {
      return;
    }

    setGameStatus(GameStatus.GAME_NOT_STARTED);
    setGameDifficultySettings(difficultyLevel)
  };

  const onGameResultModalClosed = () => {
    const gameResultModal = document.getElementById("gameResultModal");
    gameResultModal.close();
    
    generateBoard();
  };

  const randomlyDistrubuteMines = (currentTile, currentBoard, mineCount, boardSize) => {
    const rowCount = boardSize.rowCount;
    const columnCount = boardSize.columnCount;

    let allocatedMines = 0;

    const newMineLocations = [];
    
    while (allocatedMines < mineCount) {
      let row = Math.floor(Math.random() * rowCount);
      let col = Math.floor(Math.random() * columnCount);

      let tile = currentBoard[row][col];

      if ( tile.x == currentTile.x && tile.y == currentTile.y ){
        // The first tile that is subjected to a left click should be ignored when placing a mine
        // to make the game a bit easier/fairer - the user cannot lose on the 
        // the first left click
        continue;
      }

      if (!tile.hasMine ) {
        newMineLocations.push({x: tile.x, y: tile.y})
        allocatedMines++;
      }
    }
    return newMineLocations;
  };

  const getTilesWithMines = (newMineLocations, currentBoard) => {
    const tilesWithMines = [];

    for( const location of newMineLocations){
      const currentTile = currentBoard[location.x][location.y];

      const updatedTile = {
        ...currentTile,
        hasMine: true
      }
      tilesWithMines.push( updatedTile );
    }
    return tilesWithMines;
  }

  const countAdjacentMines = (selectedTile, tiles, boardSize) => {
    let adjacentMinesCount = 0;

    let x = selectedTile.x;
    let y = selectedTile.y;

    for (var i = -1; i <= 1; i++) {
      for (var j = -1; j <= 1; j++) {
        let xPos = x + i;
        let yPos = y + j;

        if (isOffBoard(xPos, yPos, boardSize)) {
          continue;
        }
        let neighbourTile = tiles[xPos][yPos];

        if ( neighbourTile.hasMine ) {
          adjacentMinesCount++;
        }
      }
    }
    return adjacentMinesCount;
  };

  const getIncorrectlyFlaggedTiles = (gameBoard, currentFlagLocations) => {
    const updatedTiles = [];

    for (const flagLocation of currentFlagLocations) {
      let tile = gameBoard[flagLocation.x][flagLocation.y];

      if (tile.hasMine) continue;

      const updatedTile = {
        ...tile,
        isIncorrectlyFlagged: true,
      };
      updatedTiles.push(updatedTile);
    }

    return updatedTiles;
  };

  const getRevealedMineTiles = (gameBoard, currentMineLocations) => {
    const updatedTiles = [];

    for (const mineLocation of currentMineLocations) {
      let tile = gameBoard[mineLocation.x][mineLocation.y];

      if (tile.isFlagged) continue;

      const updatedTile = {
        ...tile,
        isOpened: true,
      };
      updatedTiles.push(updatedTile);
    }

    return updatedTiles;
  };

  const isOffBoard = (x, y, boardSize) => {
    const rowCount = boardSize.rowCount;
    const columnCount = boardSize.columnCount;

    if (
      x < 0 || x >= rowCount || y < 0 || y >= columnCount 
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  const updateBoard = (currentBoard, updatedTiles) => {
    const updatedBoard = [...currentBoard];

    for ( const tile of updatedTiles ){
      const updatedTile = { ...tile };
      updatedBoard[tile.x][tile.y] = updatedTile;
    }
    return updatedBoard;
  };

  const openTile = (x, y, currentBoard, tilesOpenedOnClick) => {
    const boardSize = gameDifficultySettings.boardSize;

    if ( isOffBoard(x, y, boardSize) || currentBoard[x][y].isOpened ) {
      return;
    }

    let currentTile = currentBoard[x][y];

    if ( currentTile.isFlagged ){
      currentTile.isFlagged = false;
    }
    currentTile.isOpened = true;

    if (currentTile.hasMine) {
      currentTile.hasExplodedMine = true;

      const updatedBoard = [...currentBoard];
      
      const revealedMineTiles = getRevealedMineTiles(updatedBoard, mineLocations);
      const incorrectlyFlaggedTiles = getIncorrectlyFlaggedTiles(updatedBoard, flagLocations);

      const updatedTiles = [...revealedMineTiles,...incorrectlyFlaggedTiles ];

      const gameLostBoard = updateBoard(updatedBoard, updatedTiles);

      return [gameLostBoard, tilesOpenedOnClick];
    } 
    currentTile.adjacentMinesCount = countAdjacentMines(
      currentTile,
      currentBoard,
      boardSize
    );
    tilesOpenedOnClick.push(currentTile);

    if (currentTile.adjacentMinesCount === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          openTile(x + i, y + j, currentBoard, tilesOpenedOnClick);
        }
      }
    }

    return [currentBoard, tilesOpenedOnClick];
  };

  const countRemainingFlags = (currentBoard) => {
      let remainingFlagsCount = gameDifficultySettings.mineCount;

      for( var i = 0; i < currentBoard.length; i++ ){
        for( var j = 0; j < currentBoard[i].length; j++ ){
          let selectedTile = currentBoard[i][j];
          
          if ( selectedTile.isFlagged ){
            remainingFlagsCount--;
          }
        }
      }
      return remainingFlagsCount;
  }

  const onTileLeftClicked = (event) => {
    let target = event.target;
    let rowIndex = parseInt(target.dataset.row);
    let colIndex = parseInt(target.dataset.col);

    let selectedTile = board[rowIndex][colIndex];

    if (selectedTile.isOpened) {
      return;
    }

    const currentBoard = [...board];

    if ( ! minesHaveBeenAssigned ){
      const newMineLocations = randomlyDistrubuteMines(
        selectedTile,
        currentBoard,
        gameDifficultySettings.mineCount,
        gameDifficultySettings.boardSize,
      );
      const tilesWithMines = getTilesWithMines(newMineLocations, currentBoard);
      const boardWithMines = updateBoard(currentBoard, tilesWithMines);
      
      setMineLocations(newMineLocations);
      setMinesHaveBeenAssigned(true);
      setBoard(prevBoard => boardWithMines);
    }

    const [updatedBoard, tilesOpenedOnClick] = openTile(
      selectedTile.x, 
      selectedTile.y, 
      currentBoard, 
      [/* tiles opened on click*/]
    );
    
    updateGameState(
      updatedBoard,
      selectedTile,
      tilesOpenedOnClick,
    
    );
  };

  const updateGameState = ( updatedBoard, selectedTile, tilesOpenedOnClick ) => {

    let openedTilesCount = tilesOpenedOnClick.length;
    let remainingFlagsCount = countRemainingFlags(updatedBoard);

    setRemainingFlagsCount(remainingFlagsCount);
    setBoard(updatedBoard);

    if (selectedTile.hasMine) {
      setGameStatus(GameStatus.GAME_LOST);
    } 
    else if (safeTilesCount - openedTilesCount === 0) {
      setGameStatus(GameStatus.GAME_WON);
    } 
    else {
      setSafeTilesCount(
        safeTilesCount - openedTilesCount
      );
      setGameStatus(GameStatus.GAME_IN_PROGRESS);
    }
  };

  const onTileRightClicked = (event) => {
    event.preventDefault();

    let target = event.currentTarget;
    let rowIndex = parseInt(target.dataset.row);
    let colIndex = parseInt(target.dataset.col);

    let selectedTile = board[rowIndex][colIndex];

    if (selectedTile.isOpened) {
      return;
    }

    let updatedBoard = [...board];
    let flagCount = remainingFlagsCount;
    
    const isFlagged = selectedTile.isFlagged ? false : true;

    let updatedTile = {
      ...selectedTile,
      isFlagged: isFlagged
    }
    updatedBoard[rowIndex][colIndex] = updatedTile;

    let updatedFlagLocations = [];

    if ( isFlagged ){
      flagCount  = flagCount - 1;
      updatedFlagLocations = [...flagLocations, {x: selectedTile.x, y: selectedTile.y}];
    }
    else {
      flagCount = flagCount + 1;
      updatedFlagLocations = flagLocations.filter(
        (flagLocation) =>
          flagLocation.x !== selectedTile.x && flagLocation.y !== selectedTile.y
      );
    }
    setRemainingFlagsCount(flagCount);
    setFlagLocations(updatedFlagLocations);
    setBoard(updatedBoard);
  };

  const generateBoard = () => {
    const boardSize = gameDifficultySettings.boardSize;

    let rowCount = boardSize.rowCount;
    let columnCount = boardSize.columnCount;
    let mineCount = gameDifficultySettings.mineCount;

    let tiles = [];

    for (var i = 0; i < rowCount; i++) {
      const row = [];
      tiles.push(row);

      for (var j = 0; j < columnCount; j++) {
        row.push({
          x: i,
          y: j,
          hasMine: false,
          isOpened: false,
          isFlagged: false,
          adjacentMinesCount: null,
        });
      }
    }

    setMinesHaveBeenAssigned(false);
    setGameStatus(GameStatus.GAME_NOT_STARTED);
    setRemainingFlagsCount(gameDifficultySettings.mineCount);
    setSafeTilesCount(rowCount * columnCount - mineCount);
    setBoard(tiles);
  };

  const gameHasEnded = () => {
    switch (gameStatus) {
      case GameStatus.GAME_LOST:
        return true;
      case GameStatus.GAME_WON:
        return true;
      default:
        return false;
    }
  };

  const userWonGame = () => {
    if (gameStatus === GameStatus.GAME_WON) {
      return true;
    }
    return false;
  };

  return (
      <div className="wrapper">
        <h1 className="game-title">Minesweeper</h1>
        <GameDifficultySelector
          gameDifficultySettings={gameDifficultySettings}
          onChange={onGameDifficultyLevelChanged}
        ></GameDifficultySelector>
        <RemainingFlagsCounter remainingFlagsCount={remainingFlagsCount}></RemainingFlagsCounter>
        { gameHasEnded() && 
            <GameResultModal
              gameWon={userWonGame()}
              onClick={onGameResultModalClosed}
            ></GameResultModal>
        }
        <GameBoard
          board={board}
          boardSize={gameDifficultySettings.boardSize}
          onClick={onTileLeftClicked}
          onContextMenu={onTileRightClicked}
        ></GameBoard>
      </div>
  );
}

export default App;
