import { useEffect, useRef } from 'react';

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    angle: number;
    spin: number;
    size: number;
    shape: 'rect' | 'circle';
};

const COLORS = ['#f6e05e', '#68d391', '#63b3ed', '#fc8181', '#b794f4', '#f6ad55', '#76e4f7', '#fbb6ce'];

function createParticle(canvasWidth: number): Particle {
    return {
        x: Math.random() * canvasWidth,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        size: 6 + Math.random() * 8,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
}

export default function Confetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const PARTICLE_COUNT = 300;
        const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => createParticle(canvas.width));

        let frame: number;
        let count = 0;

        const targetFPS = 30;
        const interval = 1000 / targetFPS; // for targetFPS = 30, we get 33.33ms
        let lastTime = 0;

        function animate(timestamp: number) {
            if (!ctx) return false;
            if (!canvas) return false;

            if (!lastTime) lastTime = timestamp;
            const elapsed = timestamp - lastTime;
            let allGone = false;

            // Execute only if enough time has passed
            if (elapsed >= interval) {
                // Update and render logic here
                lastTime = timestamp - (elapsed % interval); // Adjust for drift
                allGone = draw();
                count++;
            }

            // stop animating after all particles have fallen off-screen
            if (!allGone && count < 600) {
                frame = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        function draw(): boolean {
            if (!ctx) return false;
            if (!canvas) return false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const p of particles) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05;
                p.angle += p.spin;
                p.vx += (Math.random() - 0.5) * 0.1;
            }

            const allGone = particles.every((p) => p.y > canvas.height + 20);
            return allGone;
        }

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 99,
            }}
        />
    );
}
