import React, { useState } from "react";

const circleSvg = (
  <svg
    viewBox="0 0 24.00 24.00"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="#867070"
    transform="matrix(-1, 0, 0, -1, 0, 0)rotate(180)"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="#867070"
      strokeWidth="4.8"
    >
      {" "}
      <path
        opacity="0.4"
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 9.20261 3.14864 6.67349 5 4.85857"
        stroke="#867070"
        strokeWidth="1.56"
        strokeLinecap="round"
      ></path>{" "}
      <path
        opacity="0.7"
        d="M5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5"
        stroke="#867070"
        strokeWidth="1.56"
        strokeLinecap="round"
      ></path>{" "}
      <path
        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8"
        stroke="#867070"
        strokeWidth="1.56"
        strokeLinecap="round"
      ></path>{" "}
    </g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        opacity="0.4"
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 9.20261 3.14864 6.67349 5 4.85857"
        stroke="#867070"
        strokeWidth="1.56"
        strokeLinecap="round"
      ></path>{" "}
      <path
        opacity="0.7"
        d="M5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5"
        stroke="#867070"
        strokeWidth="1.56"
        strokeLinecap="round"
      ></path>{" "}
      <path
        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8"
        stroke="#867070"
        strokeWidth="1.56"
        strokeLinecap="round"
      ></path>{" "}
    </g>
  </svg>
);

const crossSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="#CCCCCC"
      strokeWidth="4.8"
    >
      {" "}
      <path
        d="M19 5L5 19M5 5L9.5 9.5M12 12L19 19"
        stroke="#867070"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>{" "}
    </g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M19 5L5 19M5 5L9.5 9.5M12 12L19 19"
        stroke="#867070"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

const Square = ({
  setGameState,
  socket,
  playingAs,
  currentElement,
  finishedArrayState,
  finishedState,
  id,
  currentPlayer,
  setCurrentPlayer,
}) => {
  const [icon, setIcon] = useState(null);

  const clickOnSquare = () => {
    if (playingAs !== currentPlayer) {
      return;
    }

    if (finishedState) {
      return;
    }

    if (!icon) {
      if (currentPlayer === "circle") {
        setIcon(circleSvg);
      } else {
        setIcon(crossSvg);
      }

      const myCurrentPlayer = currentPlayer;
      socket.emit("playerMoveFromClient", {
        state: {
          id,
          sign: myCurrentPlayer,
        },
      });

      setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");

      setGameState((prevState) => {
        let newState = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newState[rowIndex][colIndex] = myCurrentPlayer;
        return newState;
      });
    }
  };

  return (
    <div
      onClick={clickOnSquare}
      className={`w-24 h-24 bg-[#D5B4B4] rounded flex items-center justify-center hover:cursor-pointer" ${
        finishedState ? "hover:cursor-not-allowed" : ""
      } ${currentPlayer !== playingAs ? "hover:cursor-not-allowed" : ""} ${
        finishedArrayState.includes(id) ? finishedState + "-won" : ""
      } ${finishedState && finishedState !== playingAs ? "bg-gray-400" : ""}`}
    >
      {currentElement === "circle"
        ? circleSvg
        : currentElement === "cross"
        ? crossSvg
        : icon}
    </div>
  );
};

export default Square;
