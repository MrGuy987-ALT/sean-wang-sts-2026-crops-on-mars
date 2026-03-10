import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import HUD from './components/HUD';
import BuildMenu from './components/BuildMenu';
import LogPanel from './components/LogPanel';
import { Building, Citizen, Resources } from './types';
import { produceResources, updateHappiness, tryBirth, consumeFood } from './utils/gameLogic';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 1200; // Tall vertical world

const buildingDefs: Record<string, { costWood: number; costStone: number; providesHousing?: number; produces?: keyof Resources; rate?: number; color: string }> = {
  house:       { costWood: 20, costStone: 10, providesHousing: 4,   color: '#a0522d' },
  woodcutter:  { costWood: 0,  costStone: 15, produces: 'wood',  rate: 0.4, color: '#8b4513' },
  mine:        { costWood: 0,  costStone: 20, produces: 'stone', rate: 0.35, color: '#808080' },
  farm:        { costWood: 30, costStone: 20, produces: 'food',  rate: 0.5, color: '#228b22' },
};

const App: React.FC = () => {
  const [resources, setResources] = useState<Resources>({ wood: 50, stone: 100, food: 30 });
  const [population, setPopulation] = useState(3);
  const [maxHousing, setMaxHousing] = useState(4);
  const [happiness, setHappiness] = useState(55);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [cameraY, setCameraY] = useState(0);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-12), msg]);
  };

  const build = (type: string) => {
    const def = buildingDefs[type];
    if (!def) return;
    if (resources.wood < def.costWood || resources.stone < def.costStone) {
      addLog(`Not enough resources for ${type}!`);
      return;
    }

    setResources(r => ({
      ...r,
      wood: r.wood - def.costWood,
      stone: r.stone - def.costStone,
    }));

    const newBuilding: Building = {
      type,
      x: Math.random() * (CANVAS_WIDTH - 60) + 30,
      y: CANVAS_HEIGHT - 80 - buildings.length * 70, // Stack upward from bottom
    };

    setBuildings(prev => [...prev, newBuilding]);

    if (def.providesHousing) {
      setMaxHousing(h => h + def.providesHousing!);
    }

    // Spawn citizen for new job/house
    if (population < maxHousing + 4) { // slight buffer
      setCitizens(prev => [
        ...prev,
        {
          x: newBuilding.x,
          y: newBuilding.y + 20,
          targetX: newBuilding.x,
          targetY: newBuilding.y,
          speed: 0.8 + Math.random() * 0.5,
          job: newBuilding,
        },
      ]);
    }

    addLog(`Built ${type}`);
  };

  // Game loop ~ every 800ms ≈ "tick"
  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => produceResources(prev, buildings, buildingDefs));
      setResources(prev => consumeFood(prev, population));
      setHappiness(h => updateHappiness(h, population, maxHousing, resources.food));

      if (Math.random() < 0.008 && happiness > 65 && population < maxHousing) {
        setPopulation(p => p + 1);
        addLog("New citizen born!");
      }

      if (happiness < 20 && Math.random() < 0.01) {
        setPopulation(p => Math.max(1, p - 1));
        addLog("Citizen left due to low happiness...");
      }

      // Auto-scroll camera upward slowly as we grow
      if (buildings.length > 5) {
        setCameraY(y => Math.min(y + 0.4, CANVAS_HEIGHT - 700));
      }
    }, 800);

    return () => clearInterval(interval);
  }, [buildings, population, maxHousing, happiness, resources.food]);

  return (
    <div className="app">
      <h1>Mars Final Earth Simulator</h1>
      <p>Vertical colony builder inspired by The Final Earth 2 – build up, keep citizens happy!</p>

      <div className="game-container">
        <Canvas
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          cameraY={cameraY}
          buildings={buildings}
          citizens={citizens}
          buildingDefs={buildingDefs}
        />

        <HUD
          resources={resources}
          population={population}
          maxHousing={maxHousing}
          happiness={happiness}
        />

        <BuildMenu buildingDefs={buildingDefs} onBuild={build} />

        <LogPanel logs={logs} />
      </div>
    </div>
  );
};

export default App;