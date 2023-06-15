import React, { useState, useEffect, useLayoutEffect } from "react";
import "./SnakeGame.css";

const initialSnake = [
  { x: 1, y: 0 },
  { x: 0, y: 0 },
];

const initialFruits = [{ x: 10, y: 10, points: 1 }];

const SnakeGame = () => {
  const [snake, setSnake] = useState(initialSnake);
  const [fruits, setFruits] = useState(initialFruits);
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(0);
  const [direction, setDirection] = useState("right");
  const [speed, setSpeed] = useState(0);
  const [growing, setGrowing] = useState(false);

  useLayoutEffect(() => {
    const hiScoreStorage = localStorage.getItem("score");
    if (hiScoreStorage) {
      setHiScore(JSON.parse(hiScoreStorage));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (key === "ArrowUp" && direction !== "down") {
        setDirection("up");
      } else if (key === "ArrowDown" && direction !== "up") {
        setDirection("down");
      } else if (key === "ArrowLeft" && direction !== "right") {
        setDirection("left");
      } else if (key === "ArrowRight" && direction !== "left") {
        setDirection("right");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const moveSnake = () => {
      const head = { ...snake[0] };

      switch (direction) {
        case "up":
          head.y = (head.y - 1 + 20) % 20;
          break;
        case "down":
          head.y = (head.y + 1) % 20;
          break;
        case "left":
          head.x = (head.x - 1 + 20) % 20;
          break;
        case "right":
          head.x = (head.x + 1) % 20;
          break;
        default:
          break;
      }

      const newSnake = [head, ...snake];
      if (!growing) {
        newSnake.pop();
      } else {
        setGrowing(false);
      }

      if (hasWallCollision(head)) {
        adjustHeadPosition(head);
      }

      if (hasSelfCollision(newSnake)) {
        gameOver();
        return;
      }

      const eatenFruitIndex = fruits.findIndex(
        (fruit) => fruit.x === head.x && fruit.y === head.y
      );
      if (eatenFruitIndex !== -1) {
        const eatenFruit = fruits[eatenFruitIndex];
        setScore((prevScore) => prevScore + eatenFruit.points);
        const updatedFruits = [...fruits];
        updatedFruits.splice(eatenFruitIndex, 1);
        setFruits(updatedFruits);
        setGrowing(true);

        if (updatedFruits.length === 0) {
          setFruits(generateFruits(newSnake));
        }
      }

      setSnake(newSnake);
    };

    const gameInterval = setInterval(moveSnake, 200 - speed * 10);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(gameInterval);
    };
  }, [snake, fruits, direction, growing]);

  useLayoutEffect(() => {
    setSpeed(Math.floor(score / 50));
    if (score > hiScore) {
      setHiScore(score);
      localStorage.setItem("score", JSON.stringify(score));
    }
  }, [score]);

  const hasWallCollision = (head) => {
    return head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20;
  };

  const adjustHeadPosition = (head) => {
    if (head.x < 0) {
      head.x = 19;
    } else if (head.x >= 20) {
      head.x = 0;
    } else if (head.y < 0) {
      head.y = 19;
    } else if (head.y >= 20) {
      head.y = 0;
    }
  };

  const hasSelfCollision = (snake) => {
    const head = snake[0];
    return snake
      .slice(1)
      .some((segment) => segment.x === head.x && segment.y === head.y);
  };

  const generateFruits = (snake) => {
    const occupiedCells = new Set(
      snake.map((segment) => `${segment.x},${segment.y}`)
    );
    const availableCells = [];

    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        const cell = `${x},${y}`;
        if (!occupiedCells.has(cell)) {
          availableCells.push({ x, y });
        }
      }
    }

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const newFruit = availableCells[randomIndex];
    newFruit.points = [1, 5, 10][Math.floor(Math.random() * 3)];

    return [newFruit];
  };

  const gameOver = () => {
    setSnake(initialSnake);
    setFruits(initialFruits);
    setScore(0);
    setDirection("right");
    setSpeed(0);
    setGrowing(false);
  };

  return (
    <div className="game-board">
      {snake.map((segment, index) => (
        <div
          key={index}
          className="snake-segment"
          style={{
            top: segment.y * 20,
            left: segment.x * 20,
          }}
        />
      ))}
      {fruits.map((fruit, index) => (
        <div
          key={index}
          className="fruit"
          style={{
            top: fruit.y * 20,
            left: fruit.x * 20,
          }}
        >
          {fruit.points}
        </div>
      ))}
      <div className="game-status">
        <div className="score">Speed: {speed + 1}</div>
        <div className="score">Score: {score}</div>
        <div className="score">Hi-Score: {hiScore}</div>
      </div>
    </div>
  );
};

export default SnakeGame;
