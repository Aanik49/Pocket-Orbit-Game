import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { EngineCallbacks, OrbitEngine } from '../game/engine';
import { GameScreen, LevelLoadout } from '../types';

export interface OrbitCanvasHandle {
  loadLevel: (levelId: number, screen: GameScreen, loadout?: LevelLoadout) => void;
  setScreen: (screen: GameScreen) => void;
  shiftOrbit: () => void;
  activateChronoPulse: () => void;
  activateStarMagnet: () => void;
  setLowPower: (enabled: boolean) => void;
}

interface OrbitCanvasProps {
  lowPower: boolean;
  onHudChange: EngineCallbacks['onHudChange'];
  onBoosterUsed: EngineCallbacks['onBoosterUsed'];
  onGameOver: EngineCallbacks['onGameOver'];
  onVictory: EngineCallbacks['onVictory'];
  onPointerTap: () => void;
}

const OrbitCanvasInner = forwardRef<OrbitCanvasHandle, OrbitCanvasProps>(
  ({ lowPower, onHudChange, onBoosterUsed, onGameOver, onVictory, onPointerTap }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<OrbitEngine | null>(null);
    const callbacksRef = useRef({ onHudChange, onBoosterUsed, onGameOver, onVictory });

    callbacksRef.current = { onHudChange, onBoosterUsed, onGameOver, onVictory };

    useImperativeHandle(
      ref,
      () => ({
        loadLevel(levelId, screen, loadout) {
          engineRef.current?.loadLevel(levelId, screen, loadout);
        },
        setScreen(screen) {
          engineRef.current?.setScreen(screen);
        },
        shiftOrbit() {
          engineRef.current?.shiftOrbit();
        },
        activateChronoPulse() {
          engineRef.current?.activateChronoPulse();
        },
        activateStarMagnet() {
          engineRef.current?.activateStarMagnet();
        },
        setLowPower(enabled) {
          engineRef.current?.setLowPower(enabled);
        },
      }),
      []
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const engine = new OrbitEngine(canvas, {
        onHudChange: (snap) => callbacksRef.current.onHudChange(snap),
        onBoosterUsed: (kind) => callbacksRef.current.onBoosterUsed(kind),
        onGameOver: (reason, stats) => callbacksRef.current.onGameOver(reason, stats),
        onVictory: (res) => callbacksRef.current.onVictory(res),
      });
      engine.setLowPower(lowPower);
      engine.start();
      engineRef.current = engine;

      const handleResize = () => engine.resize();
      const handleVisibility = () => {
        if (document.hidden) {
          engine.pauseLoop();
        } else {
          engine.resumeLoop();
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      window.visualViewport?.addEventListener('resize', handleResize);
      document.addEventListener('visibilitychange', handleVisibility);

      let observer: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
        observer = new ResizeObserver(handleResize);
        observer.observe(canvas.parentElement);
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        window.visualViewport?.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibility);
        observer?.disconnect();
        engine.destroy();
        engineRef.current = null;
      };
      // Mount once so React UI updates never interrupt the 60fps canvas loop
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      engineRef.current?.setLowPower(lowPower);
    }, [lowPower]);

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      onPointerTap();
    };

    return (
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        aria-label="Pocket Orbit gameplay area. Tap anywhere to shift orbit."
        className="absolute inset-0 block w-full h-full cursor-pointer touch-none"
      />
    );
  }
);

OrbitCanvasInner.displayName = 'OrbitCanvas';

export const OrbitCanvas = React.memo(OrbitCanvasInner);
