import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Проверяем, находимся ли мы в среде браузера
const isBrowser = typeof window !== 'undefined';

// Компонент визуализации сигналов 3D нодов
const SignalVisualizer = forwardRef((props, ref) => {
  // Локальное состояние компонента
  const [playerState, setPlayerState] = useState({
    position: { x: 2, y: 2 },
    direction: 'east',
    isJumping: false,
  });

  const [environmentState, setEnvironmentState] = useState({
    walls: [
      { x: 2, y: 3 },
      { x: 1, y: 2 },
      { x: 4, y: 4 },
      { x: 5, y: 2 },
      { x: 3, y: 5 },
    ],
    exit: { x: 7, y: 7 },
    gridSize: 10,
  });

  const [lastAction, setLastAction] = useState('Ожидание действий...');
  const [lastSignals, setLastSignals] = useState([]);
  
  // Экспортируем метод resetState, чтобы его можно было вызвать извне
  useImperativeHandle(ref, () => ({
    resetState: () => {
      // Сброс локального состояния
      setPlayerState({
        position: { x: 2, y: 2 },
        direction: 'east',
        isJumping: false,
      });
      setLastAction('Позиция сброшена в исходное состояние');
      
      // Сброс глобального состояния
      if (isBrowser && window.signalVisualizerData) {
        window.signalVisualizerData.playerState = {
          position: { x: 2, y: 2 },
          direction: 'east',
          isJumping: false
        };
        window.signalVisualizerData.lastAction = 'Позиция сброшена в исходное состояние';
        
        // Принудительно уведомляем всех подписчиков
        if (typeof window.signalVisualizerData.notifyUpdateCallbacks === 'function') {
          window.signalVisualizerData.notifyUpdateCallbacks();
        }
      }
      
      console.log('SignalVisualizer: состояние сброшено в исходное');
    }
  }));

  // Импортируем SIGNALS напрямую (для упрощения)
  const SIGNALS = {
    PLAYER_MOVE: 'PLAYER_MOVE_SIGNAL',
    PLAYER_TURN: 'PLAYER_TURN_SIGNAL',
    PLAYER_JUMP: 'PLAYER_JUMP_SIGNAL',
    WALL_CHECK: 'WALL_CHECK_SIGNAL',
    EXIT_CHECK: 'EXIT_CHECK_SIGNAL',
  };

  // Функция для обработки сигналов
  const handleSignal = (signal) => {
    console.log('Визуализатор получил сигнал:', signal);

    // Добавляем сигнал в историю
    setLastSignals(prev => [signal, ...prev.slice(0, 2)]);

    // Обрабатываем разные типы сигналов
    switch (signal.type) {
      case SIGNALS.PLAYER_MOVE:
        handleMoveSignal(signal.data);
        break;

      case SIGNALS.PLAYER_TURN:
        handleTurnSignal(signal.data);
        break;

      case SIGNALS.PLAYER_JUMP:
        handleJumpSignal(signal.data);
        break;

      case SIGNALS.WALL_CHECK:
        handleWallCheckSignal(signal.data);
        break;

      case SIGNALS.EXIT_CHECK:
        handleExitCheckSignal(signal.data);
        break;
    }
  };

  // Обработчики разных типов сигналов
  const handleMoveSignal = (data) => {
    setLastAction(`Перемещение: ${data.steps} шаг(ов), ${data.success ? 'успешно' : 'заблокировано'}`);

    if (data.success) {
      setPlayerState(prev => {
        // Вычисляем новую позицию на основе направления
        const newPosition = { ...prev.position };
        const steps = data.steps || 1;

        switch (prev.direction) {
          case 'north':
            newPosition.y -= steps;
            break;
          case 'east':
            newPosition.x += steps;
            break;
          case 'south':
            newPosition.y += steps;
            break;
          case 'west':
            newPosition.x -= steps;
            break;
        }

        // Проверяем, не выходим ли за границы сетки
        newPosition.x = Math.max(0, Math.min(environmentState.gridSize - 1, newPosition.x));
        newPosition.y = Math.max(0, Math.min(environmentState.gridSize - 1, newPosition.y));

        // Проверяем, нет ли стены
        const hasWall = environmentState.walls.some(
          wall => wall.x === newPosition.x && wall.y === newPosition.y
        );

        return hasWall ? prev : { ...prev, position: newPosition };
      });
    }
  };

  const handleTurnSignal = (data) => {
    setLastAction(`Поворот: ${data.direction}, новое направление: ${data.newDirection || 'неизвестно'}`);

    // Обновляем направление игрока
    setPlayerState(prev => ({
      ...prev,
      direction: data.newDirection || getNextDirection(prev.direction, data.direction)
    }));
  };

  const handleJumpSignal = (data) => {
    setLastAction(`Прыжок: ${data.success ? 'успешно' : 'не удалось'}`);

    // Анимируем прыжок
    if (data.success) {
      setPlayerState(prev => ({ ...prev, isJumping: true }));

      // Возвращаем в обычное состояние через секунду
      setTimeout(() => {
        setPlayerState(prev => ({ ...prev, isJumping: false }));
      }, 1000);
    }
  };

  const handleWallCheckSignal = (data) => {
    setLastAction(`Проверка стены: ${data.result ? 'стена есть' : 'путь свободен'}`);
    // Просто обновляем состояние действия, никаких изменений на карте
  };

  const handleExitCheckSignal = (data) => {
    setLastAction(`Проверка выхода: ${data.isReached ? 'выход достигнут!' : 'выход не достигнут'}`);

    // Если выход достигнут, показываем уведомление
    if (data.isReached) {
      setTimeout(() => {
        if (isBrowser) {
          alert('Поздравляем! Выход достигнут!');
        }
      }, 500);
    }
  };

  // Синхронизация с глобальным состоянием signalVisualizerData
  useEffect(() => {
    // Не выполняем на сервере
    if (!isBrowser) return;

    // Функция для синхронизации состояния с глобальным объектом
    const syncWithGlobalState = () => {
      if (window.signalVisualizerData) {
        // Обновляем состояние компонента из глобальных данных
        setPlayerState({ ...window.signalVisualizerData.playerState });
        setEnvironmentState({ ...window.signalVisualizerData.environmentState });
        setLastAction(window.signalVisualizerData.lastAction);
      }
    };

    // Выполняем начальную синхронизацию
    syncWithGlobalState();

    // Регистрируем функцию обновления в глобальном объекте
    if (window.signalVisualizerData) {
      // Функция для обновления состояния компонента при изменении глобальных данных
      const updateCallback = () => {
        syncWithGlobalState();
      };

      // Регистрируем колбек
      window.signalVisualizerData.registerUpdateCallback(updateCallback);

      // Отписываемся при размонтировании
      return () => {
        window.signalVisualizerData.unregisterUpdateCallback(updateCallback);
      };
    }
  }, []);

  // Реагируем на все сигналы, добавляя обработчик в window
  useEffect(() => {
    // Не выполняем на сервере
    if (!isBrowser) return;

    // Глобальная функция для тестовых сигналов
    window.sendTestSignal = (type, data) => {
      console.log('Отправка тестового сигнала:', type, data);
      handleSignal({ type, data, timestamp: Date.now() });
    };

    // Функция для прослушивания реальных сигналов из системы
    const signalListener = (event) => {
      if (event.detail && event.detail.type) {
        console.log('Получен пользовательский сигнал:', event.detail);
        handleSignal(event.detail);
      }
    };

    // Регистрируем прослушиватель событий
    window.addEventListener('signal', signalListener);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('signal', signalListener);
    };
  }, [playerState.direction, environmentState.gridSize]);

  // Получение следующего направления при повороте
  // ИСПРАВЛЕННАЯ ЛОГИКА ПОВОРОТА
  const getNextDirection = (currentDirection, turnDirection) => {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(currentDirection);

    if (currentIndex === -1) return 'east';

    // Исправление: при повороте налево мы идем против часовой стрелки (-1 индекс)
    // при повороте направо - по часовой (+1 индекс)
    if (turnDirection === 'right') {
      // Поворот по часовой стрелке: north -> east -> south -> west -> north
      return directions[(currentIndex + 1) % 4];
    } else { // 'left'
      // Поворот против часовой стрелки: north -> west -> south -> east -> north
      // +3 вместо -1 для избежания отрицательных индексов (математически эквивалентно -1 по модулю 4)
      return directions[(currentIndex + 3) % 4];
    }
  };

  // Функция для отрисовки сетки и объектов
  const renderGrid = () => {
    const gridCells = [];
    const { gridSize } = environmentState;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Проверяем, что находится в этой ячейке
        const isPlayer = playerState.position.x === x && playerState.position.y === y;
        const isWall = environmentState.walls.some(wall => wall.x === x && wall.y === y);
        const isExit = environmentState.exit.x === x && environmentState.exit.y === y;

        let cellContent = null;
        let cellClass = 'empty';

        if (isPlayer) {
          cellClass = playerState.isJumping ? 'player jumping' : 'player';

          // Отображаем направление игрока
          let directionSymbol = '►'; // По умолчанию восток
          switch (playerState.direction) {
            case 'north': directionSymbol = '▲'; break;
            case 'east': directionSymbol = '►'; break;
            case 'south': directionSymbol = '▼'; break;
            case 'west': directionSymbol = '◄'; break;
          }

          cellContent = <div className="player-icon">{directionSymbol}</div>;
        } else if (isWall) {
          cellClass = 'wall';
        } else if (isExit) {
          cellClass = 'exit';
          cellContent = <div className="exit-icon">🚪</div>;
        }

        gridCells.push(
          <div
            key={`${x}-${y}`}
            className={`grid-cell ${cellClass}`}
            style={{
              gridColumn: x + 1,
              gridRow: y + 1
            }}
          >
            {cellContent}
          </div>
        );
      }
    }

    return gridCells;
  };

  // Создаем тестовые кнопки
  const createTestButtons = () => {
    if (!isBrowser) return null;
    
    return (
      <div className="test-buttons">
        <button onClick={() => {
          window.sendTestSignal(SIGNALS.PLAYER_MOVE, {
            steps: 1,
            success: true,
            position: { ...playerState.position },
            direction: playerState.direction
          });
        }}>Вперед</button>

        <button onClick={() => {
          window.sendTestSignal(SIGNALS.PLAYER_TURN, {
            direction: 'left',
            previousDirection: playerState.direction,
            newDirection: getNextDirection(playerState.direction, 'left')
          });
        }}>Налево</button>

        <button onClick={() => {
          window.sendTestSignal(SIGNALS.PLAYER_TURN, {
            direction: 'right',
            previousDirection: playerState.direction,
            newDirection: getNextDirection(playerState.direction, 'right')
          });
        }}>Направо</button>

        <button onClick={() => {
          window.sendTestSignal(SIGNALS.PLAYER_JUMP, { success: true });
        }}>Прыжок</button>

        <button onClick={() => {
          // Определяем позицию перед игроком
          const pos = playerState.position;
          const dir = playerState.direction;
          let checkPos = { x: pos.x, y: pos.y };

          if (dir === 'north') checkPos.y -= 1;
          else if (dir === 'east') checkPos.x += 1;
          else if (dir === 'south') checkPos.y += 1;
          else if (dir === 'west') checkPos.x -= 1;

          // Проверяем, есть ли стена
          const wallExists = environmentState.walls.some(
            wall => wall.x === checkPos.x && wall.y === checkPos.y
          );

          window.sendTestSignal(SIGNALS.WALL_CHECK, { result: wallExists });
        }}>Проверить стену</button>

        <button onClick={() => {
          const isAtExit = playerState.position.x === environmentState.exit.x &&
            playerState.position.y === environmentState.exit.y;

          window.sendTestSignal(SIGNALS.EXIT_CHECK, { isReached: isAtExit });
        }}>Проверить выход</button>
      </div>
    );
  };

  return (
    <div className="signal-visualizer">
      <div className="action-display">{lastAction}</div>

      {/* Основной контейнер с сеткой */}
      <div className="grid-container">
        <div className="grid">{renderGrid()}</div>
        {createTestButtons()}
      </div>

      {/* <div className="signals-log">
        <h4>Последние сигналы:</h4>
        <ul>
          {lastSignals.length > 0 ? (
            lastSignals.map((signal, index) => (
              <li key={index}>
                <strong>{signal.type.replace('_SIGNAL', '')}</strong>: 
                {Object.entries(signal.data || {}).map(([key, value]) => 
                  typeof value !== 'object' ? ` ${key}=${value}` : ''
                ).join(', ')}
              </li>
            ))
          ) : (
            <li className="text-gray-400">Нет сигналов</li>
          )}
        </ul>
      </div> */}

      <style>{`
        .signal-visualizer {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          font-family: sans-serif;
          color: white;
          min-height: 240px; /* Уменьшаем минимальную высоту */
        }
        
        .action-display {
          text-align: center;
          padding: 4px;
          background-color: #2d3748;
          margin-bottom: 4px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .grid-container {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #1a202c;
          padding: 4px;
          border-radius: 4px;
          margin-bottom: 2px;
          min-height: 150px;
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(10, 18px);
          grid-template-rows: repeat(10, 18px);
          gap: 1px;
          background-color: #2d3748;
          padding: 2px;
          border-radius: 4px;
          transform: scale(0.9);
        }
        
        .grid-cell {
          width: 18px;
          height: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          border-radius: 2px;
        }
        
        .empty {
          background-color: #4a5568;
        }
        
        .wall {
          background-color: #e53e3e;
        }
        
        .exit {
          background-color: #38a169;
        }
        
        .player {
          background-color: #3182ce;
          z-index: 10;
        }
        
        .player.jumping {
          animation: jump 1s ease;
        }
        
        .player-icon, .exit-icon {
          font-size: 12px;
        }
        
        .signals-log {
          padding: 3px 6px;
          background-color: #2d3748;
          border-radius: 4px;
          max-height: 55px;
          overflow-y: auto;
          font-size: 10px;
        }
        
        .signals-log h4 {
          margin: 0 0 2px 0;
          font-size: 11px;
          color: #d6d6d6;
        }
        
        .signals-log ul {
          margin: 0;
          padding-left: 14px;
          line-height: 1.2;
        }
        
        .signals-log li {
          margin-bottom: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .test-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
          margin-top: 4px;
          justify-content: center;
        }
        
        .test-buttons button {
          padding: 3px 5px;
          background-color: #4a5568;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 9px;
        }
        
        .test-buttons button:hover {
          background-color: #2d3748;
        }
        
        @keyframes jump {
          0% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
          100% { transform: translateY(0); }
        }
        
        /* Медиа-запрос для маленьких контейнеров */
        @media (max-height: 250px) {
          .grid {
            transform: scale(0.8);
          }
          
          .signals-log {
            max-height: 40px;
          }
          
          .test-buttons button {
            padding: 2px 3px;
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
});

export default SignalVisualizer;