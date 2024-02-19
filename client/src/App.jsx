import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Heading from "./components/Heading";
import Square from "./components/Square";
import Swal from "sweetalert2";
import ConfettiExplosion from "react-confetti-explosion";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const App = () => {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);

  const checkWinner = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // column dynamic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") return true;
    });

    if (isDrawMatch) return "draw";

    return null;
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState]);

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    return result;
  };

  socket?.on("opponentLeftMatch", () => {
    setFinishedState("opponentLeftMatch");
  });

  socket?.on("playerMoveFromServer", (data) => {
    const id = data.state.id;
    setGameState((prevState) => {
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.state.sign;
      return newState;
    });
    setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
  });

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("OpponentFound", function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
  });

  async function playOnlineClick() {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;
    setPlayerName(username);

    const newSocket = io("http://localhost:8080", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket);
  }

  const restartGame = () => {
    window.location.reload(true);
  };

  if (!playOnline) {
    return (
      <div className="h-svh bg-[#867070] flex items-center justify-center">
        <button
          onClick={playOnlineClick}
          className="bg-[#D5B4B4] px-10 rounded h-20 text-[#867070] text-pretty font-bold text-3xl uppercase"
        >
          Play Online
        </button>
      </div>
    );
  }

  if (playOnline && !opponentName) {
    return (
      <div className="h-svh bg-[#867070] flex justify-center text-[#F5EBEB] items-center">
        <h1 className="uppercase">Waiting for opponent...</h1>
      </div>
    );
  }

  return (
    <div className="h-svh bg-[#867070] flex justify-center text-[#F5EBEB] pt-24">
      <div className="">
        <div className="flex items-center justify-between mb-5">
          <div
            className={`h-8 w-32 shadow-md bg-[#D5B4B4] rounded-bl-[50px] rounded-tr-[50px] text-center pt-1 text-[#867070] ${
              currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
            }`}
          >
            {playerName}
          </div>
          <div
            className={`h-8 w-32 shadow-md bg-[#D5B4B4] rounded-tl-[50px] rounded-br-[50px] text-center pt-1 text-[#867070] ${
              currentPlayer !== playingAs ? "current-move-" + currentPlayer : ""
            }`}
          >
            {opponentName}
          </div>
        </div>
        <div className="mb-7">
          <Heading />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {gameState.map((arr, rowIndex) =>
            arr.map((e, colIndex) => {
              return (
                <Square
                  socket={socket}
                  playingAs={playingAs}
                  gameState={gameState}
                  finishedArrayState={finishedArrayState}
                  finishedState={finishedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState}
                  key={rowIndex * 3 + colIndex}
                  id={rowIndex * 3 + colIndex}
                  currentElement={e}
                />
              );
            })
          )}
        </div>
        <div className="flex items-center justify-center mt-5">
          {finishedState &&
            finishedState !== "opponentLeftMatch" &&
            finishedState !== "draw" && (
              <>
                {" "}
                <h3 className="text-center text-2xl font-semibold text-[#D5B4B4]">
                  {finishedState === playingAs ? "You " : finishedState} won the
                  game
                </h3>
                <h3 className="hidden">
                  {finishedState === playingAs ? (
                    <ConfettiExplosion />
                  ) : (
                    finishedState
                  )}{" "}
                </h3>
              </>
            )}
          {finishedState &&
            finishedState !== "opponentLeftMatch" &&
            finishedState === "draw" && (
              <h3 className="text-center text-xl">It's a Draw</h3>
            )}
        </div>
        <div className="flex items-center justify-center">
          {!finishedState && opponentName && (
            <h2>You are playing against {opponentName}</h2>
          )}
          {finishedState && finishedState === "opponentLeftMatch" && (
            <h2>You won the match, Opponent has left</h2>
          )}
        </div>
        <div className="flex items-center justify-center mt-5">
          <button
            className="bg-[#D5B4B4] px-24 py-2 rounded text-[#867070]"
            onClick={restartGame}
          >
            Restart the Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
