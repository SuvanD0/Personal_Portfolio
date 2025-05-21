import { useEffect, useRef } from "react";
// @ts-ignore: matter-js has no types in node_modules
import type * as MatterType from "matter-js";
import NotFoundImg from "../assets/404NotFound.png";

const BALL_COLOR = "#e74c3c"; // Calmer, modern red

const NotFound = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let Matter: any, Engine: any, Render: any, Runner: any, World: any, Bodies: any, Body: any, Events: any, Mouse: any, MouseConstraint: any, Composite: any;
    let engine: any, world: any, render: any, runner: any, mouse: any, mouseConstraint: any;
    let growInterval: any, currentCircle: any;
    let circles: any[] = [];

    const loadScripts = async () => {
      Matter = await import("matter-js");
      ({ Engine, Render, Runner, World, Bodies, Body, Events, Mouse, MouseConstraint, Composite } = Matter);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      engine = Engine.create();
      world = engine.world;
      world.gravity.y = 0;
      world.gravity.x = 0;

      render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
          width: width,
          height: height,
          wireframes: false,
          background: getComputedStyle(document.documentElement).getPropertyValue('--background') || '#2a2a2a',
        }
      });

      Render.run(render);
      runner = Runner.create();
      Runner.run(runner, engine);

      // Add walls
      const walls = [
        Bodies.rectangle(width / 2, 0, width, 50, { isStatic: true }),
        Bodies.rectangle(width / 2, height, width, 50, { isStatic: true }),
        Bodies.rectangle(0, height / 2, 50, height, { isStatic: true }),
        Bodies.rectangle(width, height / 2, 50, height, { isStatic: true })
      ];
      World.add(world, walls);

      // Mouse control
      mouse = Mouse.create(render.canvas);
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: { visible: false }
        }
      });
      World.add(world, mouseConstraint);
      render.mouse = mouse;

      // Remove previous listeners to avoid stacking
      canvas.onmousedown = null;
      canvas.onmouseup = null;
      let radius = 10;
      let isMouseDown = false;
      canvas.addEventListener("mousedown", (e) => {
        isMouseDown = true;
        const x = e.clientX;
        const y = e.clientY;
        radius = 10;
        currentCircle = Bodies.circle(x, y, radius, {
          restitution: 0.9,
          render: {
            fillStyle: BALL_COLOR
          }
        });
        World.add(world, currentCircle);
        circles.push(currentCircle);
        growInterval = setInterval(() => {
          if (isMouseDown && radius < 60) {
            radius += 1;
            Body.scale(currentCircle, 1.05, 1.05);
          }
        }, 30);
      });
      canvas.addEventListener("mouseup", () => {
        isMouseDown = false;
        clearInterval(growInterval);
        if (currentCircle) {
          Body.setVelocity(currentCircle, {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10
          });
          currentCircle = null;
        }
      });

      // Space gravity: mutual attraction between balls
      Events.on(engine, "beforeUpdate", () => {
        for (let i = 0; i < circles.length; i++) {
          for (let j = i + 1; j < circles.length; j++) {
            const bodyA = circles[i];
            const bodyB = circles[j];
            if (!bodyA || !bodyB) continue;
            const dx = bodyB.position.x - bodyA.position.x;
            const dy = bodyB.position.y - bodyA.position.y;
            const distSq = dx * dx + dy * dy;
            if (distSq === 0) continue;
            const dist = Math.sqrt(distSq);
            const G = 0.0002;
            const force = (G * bodyA.mass * bodyB.mass) / distSq;
            const fx = (force * dx) / dist;
            const fy = (force * dy) / dist;
            Body.applyForce(bodyA, bodyA.position, { x: fx, y: fy });
            Body.applyForce(bodyB, bodyB.position, { x: -fx, y: -fy });
          }
        }
      });

      // Resize canvas on window resize
      window.addEventListener("resize", handleResize);
      function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        render.canvas.width = width;
        render.canvas.height = height;
        Render.lookAt(render, {
          min: { x: 0, y: 0 },
          max: { x: width, y: height }
        });
      }
    };

    loadScripts();
    return () => {
      if (render) {
        Render.stop(render);
        render.canvas.remove();
        render.textures = {};
      }
      if (runner) Runner.stop(runner);
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-background text-foreground overflow-hidden">
      <img
        src={NotFoundImg}
        alt="404 Not Found"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(80vw, 600px)",
          height: "auto",
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none"
        }}
      />
      <canvas ref={canvasRef} id="world" style={{ display: "block", position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1, border: "none", outline: "2px solid var(--background)", outlineOffset: "-2px" }} />
    </div>
  );
};

export default NotFound;
