import React, { useRef, useEffect, useState } from "react";

interface Ball {
  id: number;
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  color: string;
}

const BouncingBalls: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [menuActive, setMenuActive] = useState(false);
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      balls.forEach((ball) => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
          ball.dx = -ball.dx;
        }
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
          ball.dy = -ball.dy;
        }

        balls.forEach((otherBall) => {
          if (ball !== otherBall) {
            const dx = otherBall.x - ball.x;
            const dy = otherBall.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ball.radius + otherBall.radius) {
              const overlap = ball.radius + otherBall.radius - distance;
              const angle = Math.atan2(dy, dx);

              const sin = Math.sin(angle);
              const cos = Math.cos(angle);

              const vx1 = ball.dx * cos + ball.dy * sin;
              const vy1 = ball.dy * cos - ball.dx * sin;
              const vx2 = otherBall.dx * cos + otherBall.dy * sin;
              const vy2 = otherBall.dy * cos - otherBall.dx * sin;

              const finalVelX1 =
                ((ball.radius - otherBall.radius) * vx1 +
                  (otherBall.radius + ball.radius) * vx2) /
                (ball.radius + otherBall.radius);
              const finalVelX2 =
                ((ball.radius + otherBall.radius) * vx1 +
                  (otherBall.radius - ball.radius) * vx2) /
                (ball.radius + otherBall.radius);

              const finalVelY1 = vy1;
              const finalVelY2 = vy2;

              ball.dx = finalVelX1 * cos - finalVelY1 * sin;
              ball.dy = finalVelY1 * cos + finalVelX1 * sin;
              otherBall.dx = finalVelX2 * cos - finalVelY2 * sin;
              otherBall.dy = finalVelY2 * cos + finalVelX2 * sin;

              const impulseLoss = 0.8;
              ball.dx *= impulseLoss;
              ball.dy *= impulseLoss;
              otherBall.dx *= impulseLoss;
              otherBall.dy *= impulseLoss;

              const shiftX = overlap * Math.cos(angle);
              const shiftY = overlap * Math.sin(angle);
              ball.x -= shiftX;
              ball.y -= shiftY;
              otherBall.x += shiftX;
              otherBall.y += shiftY;
            }
          }
        });

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // For Cleanup
    };
  }, [balls, canvasRef]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const mouseX =
      event.clientX - canvasRef.current!.getBoundingClientRect().left;
    const mouseY =
      event.clientY - canvasRef.current!.getBoundingClientRect().top;

    balls.forEach((ball) => {
      const dx = mouseX - ball.x;
      const dy = mouseY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball.radius) {
        setMenuActive(true);
        setSelectedBall(ball);
      }
    });
  };

  const handleMouseUp = () => {
    setMenuActive(false);
    setSelectedBall(null);
  };

  const changeBallColor = (color: string) => {
    if (selectedBall) {
      const updatedBalls = balls.map((ball) =>
        ball.id === selectedBall.id ? { ...ball, color } : ball
      );
      setBalls(updatedBalls);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const newBalls: Ball[] = [];
    for (let i = 0; i < 10; i++) {
      const radius = Math.random() * 20 + 10;
      const x = Math.random() * (canvas.width - radius * 2) + radius;
      const y = Math.random() * (canvas.height - radius * 2) + radius;
      const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
      const dx = Math.random() * 4 - 2;
      const dy = Math.random() * 4 - 2;
      newBalls.push({ id: i, x, y, radius, dx, dy, color });
    }
    setBalls(newBalls);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
      {menuActive && selectedBall && (
        <div
          style={{
            position: "absolute",
            top: selectedBall.y,
            left: selectedBall.x + selectedBall.radius,
          }}
        >
          <div>
            <button
              onClick={() => changeBallColor("#ff0000")}
              style={{
                backgroundColor: "#ff0000",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "none",
              }}
            ></button>
            <button
              onClick={() => changeBallColor("#00ff00")}
              style={{
                backgroundColor: "#00ff00",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "none",
              }}
            ></button>
            <button
              onClick={() => changeBallColor("#0000ff")}
              style={{
                backgroundColor: "#0000ff",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "none",
              }}
            ></button>
            <button
              onClick={() => changeBallColor("#000")}
              style={{
                backgroundColor: "#000",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "none",
              }}
            ></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BouncingBalls;
