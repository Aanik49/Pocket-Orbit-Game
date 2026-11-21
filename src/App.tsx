import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameHud } from './components/GameHud';
import { GameOverModal, PauseModal, VictoryModal } from './components/GameModals';
import { LevelSelectModal } from './components/LevelSelectModal';
import { OrbitCanvas, OrbitCanvasHandle } from './components/OrbitCanvas';
import { SplashScreen } from './components/SplashScreen';
import { TitleOverlay } from './components/TitleOverlay';
import { spaceAudio } from './game/audio';
import { getChapterForLevel, getLevelById } from './game/levels';
import {
  getCompletionStats,
  getNextUnlockedLevelId,
  isLevelUnlocked,
  loadSaveData,
  persistSaveData,
  recordLevelCompletion,
} from './game/storage';
import { GameScreen, HudSnapshot, RunSummary, SaveData } from './types';

export default function App() {
  const [saveData, setSaveData] = useState<SaveData>(() => {
    const loaded = loadSaveData();
    spaceAudio.setMuted(loaded.muted);
    spaceAudio.setMusicMuted(loaded.musicMuted);
    return loaded;
  });

  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [activeLevelId, setActiveLevelId] = useState<number>(() => saveData.currentLevelId);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);

  const activeLevel = useMemo(() => getLevelById(activeLevelId), [activeLevelId]);
  const activeChapter = useMemo(() => getChapterForLevel(activeLevelId), [activeLevelId]);
  const stats = useMemo(() => getCompletionStats(saveData), [saveData]);

  const [hud, setHud] = useState<HudSnapshot>(() => ({
    levelId: activeLevel.id,
    starsCollected: 0,
    totalStars: activeLevel.stars.length,
    portalActive: false,
    portalOrbit: activeLevel.portal.orbit,
    targetOrbit: activeLevel.startOrbit,
    inGravityWell: false,
    gravityMode: 'none',
    shiftCount: 0,
  }));

  const canvasRef = useRef<OrbitCanvasHandle | null>(null);
  const screenRef = useRef<GameScreen>(screen);
  screenRef.current = screen;

  const showLevelSelectRef = useRef<boolean>(showLevelSelect);
  showLevelSelectRef.current = showLevelSelect;

  const showSplashRef = useRef<boolean>(showSplash);
  showSplashRef.current = showSplash;

  const activeLevelIdRef = useRef<number>(activeLevelId);
  activeLevelIdRef.current = activeLevelId;

  const saveDataRef = useRef<SaveData>(saveData);
  saveDataRef.current = saveData;

  // Sync initial preview level into the canvas once mounted
  useEffect(() => {
    canvasRef.current?.loadLevel(activeLevelId, 'TITLE');
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unlock calm ambient music on first user gesture & suspend when backgrounded
  useEffect(() => {
    const unlockOnce = () => {
      spaceAudio.unlock();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        spaceAudio.suspendForBackground();
      } else {
        spaceAudio.resumeFromBackground();
      }
    };

    window.addEventListener('pointerdown', unlockOnce, { passive: true });
    window.addEventListener('keydown', unlockOnce, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      spaceAudio.stopMusic();
    };
  }, []);

  const launchLevel = useCallback((levelId: number) => {
    if (!isLevelUnlocked(levelId, saveDataRef.current.records)) return;
    spaceAudio.unlock();
    spaceAudio.playShift(true);
    setShowLevelSelect(false);
    setRunSummary(null);
    setActiveLevelId(levelId);
    setScreen('PLAYING');
    canvasRef.current?.loadLevel(levelId, 'PLAYING');
  }, []);

  const handleStartFromTitle = useCallback(() => {
    launchLevel(activeLevelIdRef.current);
  }, [launchLevel]);

  const handleRetry = useCallback(() => {
    launchLevel(activeLevelIdRef.current);
  }, [launchLevel]);

  const handleNextLevel = useCallback(() => {
    const nextId = getNextUnlockedLevelId(activeLevelIdRef.current, saveDataRef.current.records);
    if (nextId !== null) {
      launchLevel(nextId);
    } else {
      setShowLevelSelect(true);
    }
  }, [launchLevel]);

  const handlePause = useCallback(() => {
    if (screenRef.current !== 'PLAYING') return;
    setScreen('PAUSED');
    canvasRef.current?.setScreen('PAUSED');
  }, []);

  const handleResume = useCallback(() => {
    if (screenRef.current !== 'PAUSED') return;
    setScreen('PLAYING');
    canvasRef.current?.setScreen('PLAYING');
  }, []);

  const handleReturnTitle = useCallback(() => {
    setShowLevelSelect(false);
    setRunSummary(null);
    setScreen('TITLE');
    canvasRef.current?.loadLevel(activeLevelIdRef.current, 'TITLE');
  }, []);

  const handleToggleMute = useCallback(() => {
    setSaveData((prev) => {
      const muted = !prev.muted;
      spaceAudio.setMuted(muted);
      if (!muted) {
        spaceAudio.unlock();
        spaceAudio.playShift(true);
      }
      const next = { ...prev, muted };
      persistSaveData(next);
      return next;
    });
  }, []);

  const handleToggleMusic = useCallback(() => {
    setSaveData((prev) => {
      const musicMuted = !prev.musicMuted;
      spaceAudio.setMusicMuted(musicMuted);
      if (!musicMuted) {
        spaceAudio.unlock();
      }
      const next = { ...prev, musicMuted };
      persistSaveData(next);
      return next;
    });
  }, []);

  const handleToggleLowPower = useCallback(() => {
    setSaveData((prev) => {
      const next = { ...prev, lowPower: !prev.lowPower };
      persistSaveData(next);
      return next;
    });
  }, []);

  const handlePointerTap = useCallback(() => {
    if (showSplashRef.current || showLevelSelectRef.current) return;
    if (screenRef.current === 'PLAYING') {
      spaceAudio.unlock();
      canvasRef.current?.shiftOrbit();
    }
  }, []);

  const handleGameOver = useCallback(() => {
    setScreen('GAMEOVER');
  }, []);

  const handleVictory = useCallback(
    (result: {
      levelId: number;
      flightTime: number;
      shiftCount: number;
      starsEarned: number;
    }) => {
      const lvl = getLevelById(result.levelId);
      const { next, isNewBestTime, isNewBestShifts } = recordLevelCompletion(
        saveDataRef.current,
        result.levelId,
        result.flightTime,
        result.shiftCount,
        result.starsEarned
      );
      setSaveData(next);
      setRunSummary({
        levelId: result.levelId,
        flightTime: result.flightTime,
        shiftCount: result.shiftCount,
        parShifts: lvl.parShifts,
        starsEarned: result.starsEarned,
        isNewBestTime,
        isNewBestShifts,
      });
      setScreen('VICTORY');
    },
    []
  );

  // Edge-triggered keyboard controls + window blur safety
  useEffect(() => {
    const heldKeys = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || heldKeys.has(e.code)) return;
      heldKeys.add(e.code);

      if (showSplashRef.current) {
        setShowSplash(false);
        return;
      }

      if (e.code === 'Escape') {
        if (showLevelSelectRef.current) {
          setShowLevelSelect(false);
          return;
        }
        if (screenRef.current === 'PLAYING') {
          handlePause();
        } else if (screenRef.current === 'PAUSED') {
          handleResume();
        }
        return;
      }

      if (showLevelSelectRef.current) return;

      if (e.code === 'KeyR' && (screenRef.current === 'PLAYING' || screenRef.current === 'GAMEOVER')) {
        e.preventDefault();
        handleRetry();
        return;
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'Enter') {
        e.preventDefault();
        if (screenRef.current === 'PLAYING') {
          spaceAudio.unlock();
          canvasRef.current?.shiftOrbit();
        } else if (screenRef.current === 'TITLE') {
          handleStartFromTitle();
        } else if (screenRef.current === 'GAMEOVER') {
          handleRetry();
        } else if (screenRef.current === 'VICTORY') {
          handleNextLevel();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeys.delete(e.code);
    };

    const onBlur = () => {
      heldKeys.clear();
      if (screenRef.current === 'PLAYING') {
        handlePause();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [handleNextLevel, handlePause, handleResume, handleRetry, handleStartFromTitle]);

  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-[#050814] select-none">
      {/* Animated Launch Splash Screen */}
      {showSplash && <SplashScreen onFinish={handleSplashDone} />}

      {/* Isolated 60fps Orbital Canvas */}
      <OrbitCanvas
        ref={canvasRef}
        lowPower={saveData.lowPower}
        onHudChange={setHud}
        onGameOver={handleGameOver}
        onVictory={handleVictory}
        onPointerTap={handlePointerTap}
      />

      {/* Title Screen Shell */}
      {screen === 'TITLE' && (
        <TitleOverlay
          currentLevel={activeLevel}
          currentChapter={activeChapter}
          completedCount={stats.completedCount}
          totalStars={stats.totalStars}
          muted={saveData.muted}
          musicMuted={saveData.musicMuted}
          onStart={handleStartFromTitle}
          onOpenLevels={() => setShowLevelSelect(true)}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* Active Gameplay Minimalist HUD */}
      {screen !== 'TITLE' && (
        <GameHud
          level={activeLevel}
          hud={hud}
          muted={saveData.muted}
          musicMuted={saveData.musicMuted}
          onPause={handlePause}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* Pause Modal */}
      {screen === 'PAUSED' && !showLevelSelect && (
        <PauseModal
          level={activeLevel}
          lowPower={saveData.lowPower}
          onToggleLowPower={handleToggleLowPower}
          onResume={handleResume}
          onRestart={handleRetry}
          onOpenLevels={() => setShowLevelSelect(true)}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Collision / Retry Modal */}
      {screen === 'GAMEOVER' && !showLevelSelect && (
        <GameOverModal
          level={activeLevel}
          onRetry={handleRetry}
          onOpenLevels={() => setShowLevelSelect(true)}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Victory Summary Modal */}
      {screen === 'VICTORY' && runSummary && !showLevelSelect && (
        <VictoryModal
          level={activeLevel}
          summary={runSummary}
          nextLevelId={getNextUnlockedLevelId(activeLevel.id, saveData.records)}
          onReplay={handleRetry}
          onNext={handleNextLevel}
          onOpenLevels={() => setShowLevelSelect(true)}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* 50-Level Sector Atlas */}
      {showLevelSelect && (
        <LevelSelectModal
          currentLevelId={activeLevelId}
          records={saveData.records}
          onSelectLevel={(id) => launchLevel(id)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
    </main>
  );
}
