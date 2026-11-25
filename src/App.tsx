import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DailyLoginModal, DailyMissionModal } from './components/DailyModals';
import { GameHud } from './components/GameHud';
import { GameOverModal, PauseModal, VictoryModal } from './components/GameModals';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LevelStartModal } from './components/LevelStartModal';
import { LobbyScreen } from './components/LobbyScreen';
import { OrbitCanvas, OrbitCanvasHandle } from './components/OrbitCanvas';
import { SplashScreen } from './components/SplashScreen';
import { EquipmentsModal, SpaceStationModal } from './components/StationAndEquipModals';
import { spaceAudio } from './game/audio';
import { calculateCompletionStars, getLevelById } from './game/levels';
import {
  applyDailyMissionProgress,
  buySatellite,
  buyShields,
  canClaimDailyLogin,
  claimDailyLoginReward,
  claimDailyMissionReward,
  consumeOneShield,
  equipSatellite,
  getNextUnlockedLevelId,
  hasClaimableDailyMission,
  isLevelUnlocked,
  loadSaveData,
  persistSaveData,
  recordLevelCompletion,
} from './game/storage';
import {
  GameOverReason,
  GameScreen,
  HudSnapshot,
  RunSummary,
  SatelliteId,
  SaveData,
} from './types';

type LobbyModal =
  | null
  | 'sectors'
  | 'daily_login'
  | 'daily_mission'
  | 'space_station'
  | 'equipments'
  | 'level_start';

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
  const [pendingStartLevelId, setPendingStartLevelId] = useState<number>(() => saveData.currentLevelId);
  const [atlasInitialChapter, setAtlasInitialChapter] = useState<number | undefined>(undefined);
  const [activeModal, setActiveModal] = useState<LobbyModal>(null);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>('collision');
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);

  const activeLevel = useMemo(() => getLevelById(activeLevelId), [activeLevelId]);
  const pendingStartLevel = useMemo(() => getLevelById(pendingStartLevelId), [pendingStartLevelId]);

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
    timeLimit: activeLevel.timeLimit,
    timeRemaining: activeLevel.timeLimit,
    timerDisabled: false,
    shieldActive: false,
    satelliteId: saveData.selectedSatellite,
  }));

  const canvasRef = useRef<OrbitCanvasHandle | null>(null);
  const screenRef = useRef<GameScreen>(screen);
  screenRef.current = screen;

  const activeModalRef = useRef<LobbyModal>(activeModal);
  activeModalRef.current = activeModal;

  const showSplashRef = useRef<boolean>(showSplash);
  showSplashRef.current = showSplash;

  const activeLevelIdRef = useRef<number>(activeLevelId);
  activeLevelIdRef.current = activeLevelId;

  const saveDataRef = useRef<SaveData>(saveData);
  saveDataRef.current = saveData;

  useEffect(() => {
    canvasRef.current?.loadLevel(activeLevelId, 'TITLE');
    // Mount only
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

  /** Opens the pre-launch Loadout panel (satellite selector + shield toggle) before starting a level */
  const openLevelStartPanel = useCallback((levelId: number) => {
    if (!isLevelUnlocked(levelId, saveDataRef.current.records)) return;
    spaceAudio.unlock();
    setPendingStartLevelId(levelId);
    setActiveModal('level_start');
  }, []);

  /** Launches gameplay immediately with chosen satellite and optional 1-shield consumption */
  const launchLevelWithLoadout = useCallback(
    (levelId: number, useShield: boolean) => {
      const currentSave = saveDataRef.current;
      if (!isLevelUnlocked(levelId, currentSave.records)) return;

      let shieldArmed = false;
      if (useShield && currentSave.shields > 0) {
        shieldArmed = true;
        const nextSave = consumeOneShield(currentSave);
        setSaveData(nextSave);
      }

      const satelliteId = currentSave.selectedSatellite;
      spaceAudio.unlock();
      spaceAudio.playShift(true);

      setActiveModal(null);
      setRunSummary(null);
      setGameOverReason('collision');
      setActiveLevelId(levelId);
      setScreen('PLAYING');
      canvasRef.current?.loadLevel(levelId, 'PLAYING', {
        satelliteId,
        shieldActive: shieldArmed,
      });
    },
    []
  );

  const handlePlayFromLobby = useCallback(() => {
    openLevelStartPanel(saveDataRef.current.currentLevelId);
  }, [openLevelStartPanel]);

  const handleRetryImmediate = useCallback(() => {
    launchLevelWithLoadout(activeLevelIdRef.current, false);
  }, [launchLevelWithLoadout]);

  const handleNextLevel = useCallback(() => {
    const nextId = getNextUnlockedLevelId(activeLevelIdRef.current, saveDataRef.current.records);
    if (nextId !== null) {
      openLevelStartPanel(nextId);
    } else {
      setAtlasInitialChapter(undefined);
      setActiveModal('sectors');
    }
  }, [openLevelStartPanel]);

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
    setActiveModal(null);
    setRunSummary(null);
    setScreen('TITLE');
    canvasRef.current?.loadLevel(saveDataRef.current.currentLevelId, 'TITLE');
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
    if (showSplashRef.current || activeModalRef.current !== null) return;
    if (screenRef.current === 'PLAYING') {
      spaceAudio.unlock();
      canvasRef.current?.shiftOrbit();
    }
  }, []);

  const handleGameOver = useCallback(
    (reason: GameOverReason, runStats: { orbitalStars: number; shifts: number }) => {
      setGameOverReason(reason);
      // Credit partial orbital stars & shifts toward today's Daily Missions even on a failed attempt
      if (runStats.orbitalStars > 0 || runStats.shifts > 0) {
        setSaveData((prev) =>
          applyDailyMissionProgress(prev, {
            orbital_stars: runStats.orbitalStars,
            shifts: runStats.shifts,
          })
        );
      }
      setScreen('GAMEOVER');
    },
    []
  );

  const handleVictory = useCallback(
    (result: {
      levelId: number;
      flightTime: number;
      shiftCount: number;
      starsEarned: number;
      orbitalStars: number;
    }) => {
      const lvl = getLevelById(result.levelId);
      const earnedRating = calculateCompletionStars(result.shiftCount, lvl.parShifts);
      const {
        next,
        isNewBestTime,
        isNewBestShifts,
        starsAddedToLobby,
        sectorBonusRockets,
        completedSectorTitle,
      } = recordLevelCompletion(
        saveDataRef.current,
        result.levelId,
        result.flightTime,
        result.shiftCount,
        earnedRating,
        result.orbitalStars
      );
      setSaveData(next);
      setRunSummary({
        levelId: result.levelId,
        flightTime: result.flightTime,
        shiftCount: result.shiftCount,
        parShifts: lvl.parShifts,
        starsEarned: earnedRating,
        starsAddedToLobby,
        sectorBonusRockets,
        completedSectorTitle,
        isNewBestTime,
        isNewBestShifts,
      });
      setScreen('VICTORY');
    },
    []
  );

  // Economy & Daily callbacks
  const handleClaimDailyLogin = useCallback(() => {
    spaceAudio.unlock();
    spaceAudio.playStar(2);
    setSaveData((prev) => claimDailyLoginReward(prev));
  }, []);

  const handleClaimDailyMission = useCallback((missionId: string) => {
    spaceAudio.unlock();
    spaceAudio.playStar(3);
    setSaveData((prev) => claimDailyMissionReward(prev, missionId));
  }, []);

  const handleBuySatellite = useCallback((id: SatelliteId) => {
    spaceAudio.unlock();
    spaceAudio.playPortalOpen();
    setSaveData((prev) => buySatellite(prev, id));
  }, []);

  const handleEquipSatellite = useCallback((id: SatelliteId) => {
    spaceAudio.unlock();
    spaceAudio.playShift(true);
    setSaveData((prev) => equipSatellite(prev, id));
  }, []);

  const handleBuyShields = useCallback((qty: number) => {
    spaceAudio.unlock();
    spaceAudio.playStar(1);
    setSaveData((prev) => buyShields(prev, qty));
  }, []);

  // Keyboard shortcuts + window blur safety
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
        if (activeModalRef.current !== null) {
          setActiveModal(null);
          return;
        }
        if (screenRef.current === 'PLAYING') {
          handlePause();
        } else if (screenRef.current === 'PAUSED') {
          handleResume();
        }
        return;
      }

      if (activeModalRef.current !== null) return;

      if (e.code === 'KeyR' && (screenRef.current === 'PLAYING' || screenRef.current === 'GAMEOVER')) {
        e.preventDefault();
        handleRetryImmediate();
        return;
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'Enter') {
        e.preventDefault();
        if (screenRef.current === 'PLAYING') {
          spaceAudio.unlock();
          canvasRef.current?.shiftOrbit();
        } else if (screenRef.current === 'TITLE') {
          handlePlayFromLobby();
        } else if (screenRef.current === 'GAMEOVER') {
          handleRetryImmediate();
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
  }, [handleNextLevel, handlePause, handlePlayFromLobby, handleResume, handleRetryImmediate]);

  // Preload & decode cosmic lobby assets on startup so Lobby transitions are always instant
  useEffect(() => {
    const assets = [
      './assets/cosmic/lobby-bg.png',
      './assets/cosmic/logo.png',
      './assets/cosmic/rocket.png',
      './assets/cosmic/btn-play.png',
      './assets/cosmic/btn-music.png',
      './assets/cosmic/btn-sound.png',
      './assets/cosmic/pill-star.png',
      './assets/cosmic/pill-rocket.png',
      './assets/cosmic/dock-sectors.png',
      './assets/cosmic/dock-daily-login.png',
      './assets/cosmic/dock-daily-mission.png',
      './assets/cosmic/dock-equipments.png',
      './assets/cosmic/dock-space-station.png',
      './assets/cosmic/icon-shield.png',
      './assets/cosmic/icon-radio.png',
    ];
    assets.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    });
  }, []);

  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
  }, []);

  const dailyLoginClaimable = canClaimDailyLogin(saveData.dailyLogin);
  const dailyMissionClaimable = hasClaimableDailyMission(saveData.dailyMissions);

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-[#080C38] select-none">
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

      {/* Keep Cosmic Space Lobby mounted for instant, zero-lag scene transitions */}
      <LobbyScreen
        isVisible={screen === 'TITLE'}
        lobbyStars={saveData.stars}
        lobbyRockets={saveData.rockets}
        currentLevelId={saveData.currentLevelId}
        records={saveData.records}
        muted={saveData.muted}
        musicMuted={saveData.musicMuted}
        dailyLoginClaimable={dailyLoginClaimable}
        dailyMissionClaimable={dailyMissionClaimable}
        onPlayCurrent={handlePlayFromLobby}
        onOpenSectorAtlas={(chapterId) => {
          setAtlasInitialChapter(chapterId);
          setActiveModal('sectors');
        }}
        onOpenDailyLogin={() => setActiveModal('daily_login')}
        onOpenDailyMission={() => setActiveModal('daily_mission')}
        onOpenEquipments={() => setActiveModal('equipments')}
        onOpenSpaceStation={() => setActiveModal('space_station')}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
      />

      {/* Active Gameplay Cosmic HUD */}
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
      {screen === 'PAUSED' && activeModal === null && (
        <PauseModal
          level={activeLevel}
          lowPower={saveData.lowPower}
          onToggleLowPower={handleToggleLowPower}
          onResume={handleResume}
          onRestart={() => openLevelStartPanel(activeLevel.id)}
          onOpenLevels={() => {
            setAtlasInitialChapter(activeLevel.chapter);
            setActiveModal('sectors');
          }}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Collision / Timeout Modal */}
      {screen === 'GAMEOVER' && activeModal === null && (
        <GameOverModal
          level={activeLevel}
          reason={gameOverReason}
          onRetry={handleRetryImmediate}
          onOpenLoadout={() => openLevelStartPanel(activeLevel.id)}
          onOpenLevels={() => {
            setAtlasInitialChapter(activeLevel.chapter);
            setActiveModal('sectors');
          }}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Victory Summary Modal */}
      {screen === 'VICTORY' && runSummary && activeModal === null && (
        <VictoryModal
          level={activeLevel}
          summary={runSummary}
          nextLevelId={getNextUnlockedLevelId(activeLevel.id, saveData.records)}
          onReplay={() => openLevelStartPanel(activeLevel.id)}
          onNext={handleNextLevel}
          onOpenLevels={() => {
            setAtlasInitialChapter(activeLevel.chapter);
            setActiveModal('sectors');
          }}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* 6-Sector / 60-Level Atlas */}
      {activeModal === 'sectors' && (
        <LevelSelectModal
          currentLevelId={saveData.currentLevelId}
          initialChapterId={atlasInitialChapter}
          records={saveData.records}
          onSelectLevel={(id) => openLevelStartPanel(id)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Pre-Launch Loadout Panel (Satellite Selection + Shield Toggle) */}
      {activeModal === 'level_start' && (
        <LevelStartModal
          level={pendingStartLevel}
          ownedSatellites={saveData.ownedSatellites}
          selectedSatellite={saveData.selectedSatellite}
          shieldsOwned={saveData.shields}
          onSelectSatellite={handleEquipSatellite}
          onLaunch={(useShield) => launchLevelWithLoadout(pendingStartLevel.id, useShield)}
          onOpenSpaceStation={() => setActiveModal('space_station')}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Daily Login 7-Day Rewards Modal */}
      {activeModal === 'daily_login' && (
        <DailyLoginModal
          loginState={saveData.dailyLogin}
          onClaim={handleClaimDailyLogin}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Daily Missions Modal */}
      {activeModal === 'daily_mission' && (
        <DailyMissionModal
          missionState={saveData.dailyMissions}
          onClaimMission={handleClaimDailyMission}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Space Station Shop Modal (4 Satellites + Shields) */}
      {activeModal === 'space_station' && (
        <SpaceStationModal
          lobbyStars={saveData.stars}
          lobbyRockets={saveData.rockets}
          shieldsOwned={saveData.shields}
          ownedSatellites={saveData.ownedSatellites}
          selectedSatellite={saveData.selectedSatellite}
          records={saveData.records}
          onBuySatellite={handleBuySatellite}
          onEquipSatellite={handleEquipSatellite}
          onBuyShields={handleBuyShields}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Equipments Hangar Modal (Owned Satellites & Shields) */}
      {activeModal === 'equipments' && (
        <EquipmentsModal
          ownedSatellites={saveData.ownedSatellites}
          selectedSatellite={saveData.selectedSatellite}
          shieldsOwned={saveData.shields}
          onEquipSatellite={handleEquipSatellite}
          onOpenSpaceStation={() => setActiveModal('space_station')}
          onClose={() => setActiveModal(null)}
        />
      )}
    </main>
  );
}
