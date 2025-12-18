import{w as ae}from"./with-props-CdbLO-WJ.js";import{a as o,o as e,s as ne}from"./chunk-AYJ5UCUI-B1579ApN.js";import{s as re,S as D,u as oe,c as le,d as ce,N as de,R as ue,a as xe,b as _,F as ge,C as pe,e as fe,E as we}from"./FlowCanvas-jW2CS78L.js";import{F as me}from"./Bars3Icon-BkkQTm41.js";import"./XMarkIcon-D64FOle9.js";import"./CheckCircleIcon-UDH-7wKd.js";import"./ExclamationTriangleIcon-LoCsT_0_.js";import"./ChevronDownIcon-BxZwbkus.js";import"./index-BHLz7_dj.js";import"./RocketLaunchIcon-B-1hGzc_.js";import"./UserIcon-CGgSBpiG.js";import"./ArrowPathIcon-CYqLai-V.js";import"./DocumentTextIcon-Bx8j1DmN.js";import"./CodeBracketIcon-TE7D0uFq.js";const R=typeof window<"u",he=o.forwardRef((i,p)=>{const[a,d]=o.useState({position:{x:2,y:2},direction:"east",isJumping:!1}),[l,v]=o.useState({walls:[{x:2,y:3},{x:1,y:2},{x:4,y:4},{x:5,y:2},{x:3,y:5}],exit:{x:7,y:7},gridSize:10}),[j,m]=o.useState("Ожидание действий..."),[J,M]=o.useState([]);o.useImperativeHandle(p,()=>({resetState:()=>{d({position:{x:2,y:2},direction:"east",isJumping:!1}),m("Позиция сброшена в исходное состояние"),R&&window.signalVisualizerData&&(window.signalVisualizerData.playerState={position:{x:2,y:2},direction:"east",isJumping:!1},window.signalVisualizerData.lastAction="Позиция сброшена в исходное состояние",typeof window.signalVisualizerData.notifyUpdateCallbacks=="function"&&window.signalVisualizerData.notifyUpdateCallbacks()),console.log("SignalVisualizer: состояние сброшено в исходное")}}));const f={PLAYER_MOVE:"PLAYER_MOVE_SIGNAL",PLAYER_TURN:"PLAYER_TURN_SIGNAL",PLAYER_JUMP:"PLAYER_JUMP_SIGNAL",WALL_CHECK:"WALL_CHECK_SIGNAL",EXIT_CHECK:"EXIT_CHECK_SIGNAL"},V=t=>{switch(console.log("Визуализатор получил сигнал:",t),M(s=>[t,...s.slice(0,2)]),t.type){case f.PLAYER_MOVE:I(t.data);break;case f.PLAYER_TURN:U(t.data);break;case f.PLAYER_JUMP:A(t.data);break;case f.WALL_CHECK:E(t.data);break;case f.EXIT_CHECK:L(t.data);break}},I=t=>{m(`Перемещение: ${t.steps} шаг(ов), ${t.success?"успешно":"заблокировано"}`),t.success&&d(s=>{const n={...s.position},c=t.steps||1;switch(s.direction){case"north":n.y-=c;break;case"east":n.x+=c;break;case"south":n.y+=c;break;case"west":n.x-=c;break}return n.x=Math.max(0,Math.min(l.gridSize-1,n.x)),n.y=Math.max(0,Math.min(l.gridSize-1,n.y)),l.walls.some(z=>z.x===n.x&&z.y===n.y)?s:{...s,position:n}})},U=t=>{m(`Поворот: ${t.direction}, новое направление: ${t.newDirection||"неизвестно"}`),d(s=>({...s,direction:t.newDirection||y(s.direction,t.direction)}))},A=t=>{m(`Прыжок: ${t.success?"успешно":"не удалось"}`),t.success&&(d(s=>({...s,isJumping:!0})),setTimeout(()=>{d(s=>({...s,isJumping:!1}))},1e3))},E=t=>{m(`Проверка стены: ${t.result?"стена есть":"путь свободен"}`)},L=t=>{m(`Проверка выхода: ${t.isReached?"выход достигнут!":"выход не достигнут"}`),t.isReached&&setTimeout(()=>{R&&alert("Поздравляем! Выход достигнут!")},500)};o.useEffect(()=>{if(!R)return;const t=()=>{window.signalVisualizerData&&(d({...window.signalVisualizerData.playerState}),v({...window.signalVisualizerData.environmentState}),m(window.signalVisualizerData.lastAction))};if(t(),window.signalVisualizerData){const s=()=>{t()};return window.signalVisualizerData.registerUpdateCallback(s),()=>{window.signalVisualizerData.unregisterUpdateCallback(s)}}},[]),o.useEffect(()=>{if(!R)return;window.sendTestSignal=(s,n)=>{console.log("Отправка тестового сигнала:",s,n),V({type:s,data:n,timestamp:Date.now()})};const t=s=>{s.detail&&s.detail.type&&(console.log("Получен пользовательский сигнал:",s.detail),V(s.detail))};return window.addEventListener("signal",t),()=>{window.removeEventListener("signal",t)}},[a.direction,l.gridSize]);const y=(t,s)=>{const n=["north","east","south","west"],c=n.indexOf(t);return c===-1?"east":s==="right"?n[(c+1)%4]:n[(c+3)%4]},S=()=>{const t=[],{gridSize:s}=l;for(let n=0;n<s;n++)for(let c=0;c<s;c++){const N=a.position.x===c&&a.position.y===n,z=l.walls.some(h=>h.x===c&&h.y===n),T=l.exit.x===c&&l.exit.y===n;let w=null,C="empty";if(N){C=a.isJumping?"player jumping":"player";let h="►";switch(a.direction){case"north":h="▲";break;case"east":h="►";break;case"south":h="▼";break;case"west":h="◄";break}w=e.jsx("div",{className:"player-icon",children:h})}else z?C="wall":T&&(C="exit",w=e.jsx("div",{className:"exit-icon",children:"🚪"}));t.push(e.jsx("div",{className:`grid-cell ${C}`,style:{gridColumn:c+1,gridRow:n+1},children:w},`${c}-${n}`))}return t},P=()=>R?e.jsxs("div",{className:"test-buttons",children:[e.jsx("button",{onClick:()=>{window.sendTestSignal(f.PLAYER_MOVE,{steps:1,success:!0,position:{...a.position},direction:a.direction})},children:"Вперед"}),e.jsx("button",{onClick:()=>{window.sendTestSignal(f.PLAYER_TURN,{direction:"left",previousDirection:a.direction,newDirection:y(a.direction,"left")})},children:"Налево"}),e.jsx("button",{onClick:()=>{window.sendTestSignal(f.PLAYER_TURN,{direction:"right",previousDirection:a.direction,newDirection:y(a.direction,"right")})},children:"Направо"}),e.jsx("button",{onClick:()=>{window.sendTestSignal(f.PLAYER_JUMP,{success:!0})},children:"Прыжок"}),e.jsx("button",{onClick:()=>{const t=a.position,s=a.direction;let n={x:t.x,y:t.y};s==="north"?n.y-=1:s==="east"?n.x+=1:s==="south"?n.y+=1:s==="west"&&(n.x-=1);const c=l.walls.some(N=>N.x===n.x&&N.y===n.y);window.sendTestSignal(f.WALL_CHECK,{result:c})},children:"Проверить стену"}),e.jsx("button",{onClick:()=>{const t=a.position.x===l.exit.x&&a.position.y===l.exit.y;window.sendTestSignal(f.EXIT_CHECK,{isReached:t})},children:"Проверить выход"})]}):null;return e.jsxs("div",{className:"signal-visualizer",children:[e.jsx("div",{className:"action-display",children:j}),e.jsxs("div",{className:"grid-container",children:[e.jsx("div",{className:"grid",children:S()}),P()]}),e.jsx("style",{children:`
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
      `})]})}),g=typeof window<"u";g&&(window.signalVisualizerData={playerState:{position:{x:2,y:2},direction:"east",isJumping:!1},environmentState:{walls:[{x:2,y:3},{x:1,y:2},{x:4,y:4},{x:5,y:2},{x:3,y:5}],exit:{x:7,y:7},gridSize:10},lastAction:"Система запущена",lastSignals:[],updateCallbacks:[],registerUpdateCallback:i=>{g&&window.signalVisualizerData.updateCallbacks.push(i)},unregisterUpdateCallback:i=>{g&&(window.signalVisualizerData.updateCallbacks=window.signalVisualizerData.updateCallbacks.filter(p=>p!==i))},notifyUpdateCallbacks:()=>{g&&window.signalVisualizerData.updateCallbacks.forEach(i=>{try{i(window.signalVisualizerData)}catch(p){console.error("Ошибка при вызове колбэка визуализатора:",p)}})}});function be(){return g?(window.signalVisualizerUnsubscribe&&window.signalVisualizerUnsubscribe(),window.signalVisualizerUnsubscribe=re(ye),console.log("Коннектор визуализатора сигналов инициализирован"),window.signalVisualizerData):(console.log("Коннектор не инициализирован - серверная среда"),null)}function ye(i){if(g){switch(console.log("Коннектор получил сигнал:",i.type,i.data),window.signalVisualizerData.lastSignals.unshift({type:i.type,data:i.data,timestamp:i.timestamp||Date.now()}),window.signalVisualizerData.lastSignals.length>5&&window.signalVisualizerData.lastSignals.pop(),i.type){case D.PLAYER_MOVE:Se(i.data);break;case D.PLAYER_TURN:ke(i.data);break;case D.PLAYER_JUMP:ve(i.data);break;case D.WALL_CHECK:Ce(i.data);break;case D.EXIT_CHECK:je(i.data);break;case D.NODE_EXECUTED:break;default:window.signalVisualizerData.lastAction=`Получен неизвестный сигнал: ${i.type}`;break}window.signalVisualizerData.notifyUpdateCallbacks()}}function Se(i){if(g&&(window.signalVisualizerData.lastAction=`Перемещение: ${i.steps} шаг(ов), ${i.success?"успешно":"заблокировано"}`,i.success)){const p=window.signalVisualizerData.playerState,a=p.direction,d=i.steps||1,l={...p.position};switch(a){case"north":l.y=Math.max(0,l.y-d);break;case"east":l.x=Math.min(window.signalVisualizerData.environmentState.gridSize-1,l.x+d);break;case"south":l.y=Math.min(window.signalVisualizerData.environmentState.gridSize-1,l.y+d);break;case"west":l.x=Math.max(0,l.x-d);break}window.signalVisualizerData.environmentState.walls.some(j=>j.x===l.x&&j.y===l.y)?window.signalVisualizerData.lastAction="Перемещение заблокировано: впереди стена":window.signalVisualizerData.playerState.position=l}}function ke(i){if(g)if(window.signalVisualizerData.lastAction=`Поворот: ${i.direction==="left"?"налево":"направо"}, новое направление: ${i.newDirection||"неизвестно"}`,i.newDirection)console.log(`Поворот: обновление направления на ${i.newDirection} (из данных сигнала)`),window.signalVisualizerData.playerState.direction=i.newDirection;else{const p=["north","east","south","west"],a=window.signalVisualizerData.playerState.direction,d=p.indexOf(a);if(d!==-1){const l=i.direction==="right"?(d+1)%4:(d+3)%4,v=p[l];console.log(`Поворот: вычисленное направление ${a} -> ${v} (${i.direction})`),window.signalVisualizerData.playerState.direction=v}}}function ve(i){g&&(window.signalVisualizerData.lastAction=`Прыжок: ${i.success?"успешно":"не удалось"}`,i.success&&(window.signalVisualizerData.playerState.isJumping=!0,setTimeout(()=>{window.signalVisualizerData.playerState.isJumping=!1,window.signalVisualizerData.notifyUpdateCallbacks()},1e3)))}function Ce(i){g&&(window.signalVisualizerData.lastAction=`Проверка стены: ${i.result?"стена есть":"путь свободен"}`)}function je(i){g&&(window.signalVisualizerData.lastAction=`Проверка выхода: ${i.isReached?"выход достигнут!":"выход не достигнут"}`,i.isReached&&setTimeout(()=>{g&&window.alert&&window.alert("Поздравляем! Выход достигнут!")},500))}function Ne(){return g?(console.log("Сброс позиции игрока через signalVisualizerConnector..."),window.signalVisualizerData.playerState={position:{x:2,y:2},direction:"east",isJumping:!1},window.signalVisualizerData.lastAction="Позиция сброшена в исходное состояние",window.signalVisualizerData.notifyUpdateCallbacks(),console.log("Позиция игрока сброшена в исходное состояние",window.signalVisualizerData.playerState),!0):(console.log("Сброс позиции не выполнен - серверная среда"),!1)}g&&be();const B=typeof window<"u",Ee=()=>{const[i,p]=o.useState(!1),[a,d]=o.useState(!1),[l,v]=o.useState(!1),[j,m]=o.useState(!1),{nodes:J,setNodes:M,edges:f,projectName:V,saveProject:I,loadProject:U,refreshProjectsList:A}=oe(),E=o.useRef(null),L=o.useRef(null);let y=null;try{y=o.useContext?o.useContext(y):null}catch{console.log("3D сцена недоступна, продолжаем без неё")}const[S,P]=o.useState(""),t=r=>(r.preventDefault(),!1),s=()=>{B&&(Ne(),E.current&&typeof E.current.resetState=="function"&&E.current.resetState(),y&&typeof y.resetScene=="function"&&y.resetScene())},{consoleOutput:n,stopExecution:c,executeStep:N}=le(J,f,M,{resetVisualizerState:s}),[z,T]=o.useState(null),[w,C]=o.useState(!1),[h,H]=o.useState(0),x=o.useRef(null),[G,$]=o.useState(!1),[F,X]=o.useState([]);o.useEffect(()=>(p(!0),K(),A(),()=>{x.current&&clearTimeout(x.current)}),[A]);const K=()=>{if(B)try{const r=[],u="nodeEditor_project_";for(let k=0;k<localStorage.length;k++){const W=localStorage.key(k);W&&W.startsWith(u)&&r.push(W.replace(u,""))}console.log("Найдено сохранений:",r.length,r),X(r),S&&!r.includes(S)&&P("")}catch(r){console.error("Ошибка при загрузке списка быстрых сохранений:",r)}},b=(r,u="info")=>{T({message:r,type:u})},q=()=>{T(null)},Y=()=>{if(!w)return;if(G){x.current=setTimeout(Y,500);return}$(!0);const r=N();if(H(u=>u+1),r&&!r.isComplete)setTimeout(()=>{$(!1)},700),x.current=setTimeout(Y,1200);else{C(!1),$(!1);let u=!1;n&&n.length>0&&(u=n.some(k=>k.type==="output"&&(k.value.includes("выход достигнут")||k.value.includes("Выход достигнут")))),u?b("Симуляция завершена. Выход успешно достигнут!","success"):(s(),b("Симуляция завершена. Выход не был достигнут. Уровень сброшен.","info"))}};o.useEffect(()=>(w&&!x.current?x.current=setTimeout(Y,500):!w&&x.current&&(clearTimeout(x.current),x.current=null),()=>{x.current&&(clearTimeout(x.current),x.current=null)}),[w,G]);const Z=()=>{if(w){O();return}H(0),s(),C(!0),b("Начинаем плавную симуляцию...","info")},O=()=>{c(),C(!1),$(!1),x.current&&(clearTimeout(x.current),x.current=null),s(),b("Симуляция остановлена","info")},ee=()=>{},te=()=>{const r=`debug_${new Date().toISOString().slice(0,19).replace(/[-:T]/g,"_")}`;I(r)?(K(),b(`Быстрое сохранение создано: ${r}`,"success")):b("Ошибка при создании быстрого сохранения","error")},ie=()=>{if(!S){b("Выберите сохранение для загрузки","warning");return}w&&O(),U(S)?(s(),b(`Сохранение загружено: ${S}`,"success")):b("Ошибка при загрузке сохранения","error")},se=[_.VARIABLES,_.CONTROL,_.OPERATIONS,_.SCENE_3D];o.useEffect(()=>{const r=()=>{d(window.innerWidth<768)};return r(),window.addEventListener("resize",r),()=>{window.removeEventListener("resize",r)}},[]),o.useEffect(()=>{const r=window.matchMedia("(prefers-color-scheme: dark)");v(r.matches);const u=k=>{v(k.matches)};return r.addEventListener("change",u),()=>{r.removeEventListener("change",u)}},[]);const Q=o.useCallback((r,u)=>{a&&setTimeout(()=>{L.current&&(L.current.addNode(r,u),m(!1))},50)},[a]);return e.jsx(ce,{children:e.jsxs("div",{className:"w-full h-screen bg-gray-50 dark:bg-gray-900 flex flex-col",children:[e.jsx("nav",{className:"bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700",children:e.jsx("div",{className:"w-full px-4 sm:px-6 lg:px-8",children:e.jsxs("div",{className:"flex justify-between h-16",children:[e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs(ne,{to:"/",className:"block relative",onContextMenu:t,children:[e.jsx("img",{src:"/logo.png",alt:"EduPlatform Logo",className:"h-10 sm:h-12 w-auto select-none light-mode-logo",draggable:"false"}),e.jsx("img",{src:"/dark logo.png",alt:"EduPlatform Logo",className:"h-10 sm:h-12 w-auto select-none dark-mode-logo",draggable:"false"}),e.jsx("div",{className:"absolute inset-0 z-10",onContextMenu:t,onClick:r=>r.stopPropagation()})]}),e.jsx("div",{className:"h-8 w-px bg-gray-300 dark:bg-gray-600"}),e.jsxs("h1",{className:`${a?"text-base":"text-lg"} font-medium text-gray-800 dark:text-white truncate`,children:["3D Редактор уровней ",V?`- ${V}`:""]})]}),a&&e.jsx("div",{className:"flex items-center",children:e.jsx("button",{className:"p-2 rounded-md text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white focus:outline-none",onClick:()=>m(!j),children:e.jsx(me,{className:"h-6 w-6"})})})]})})}),e.jsx(de,{notification:z,onClose:q,autoHideTime:3e3}),e.jsx("div",{className:"flex flex-1 h-[calc(100vh-4rem)]",children:i&&e.jsxs(ue,{children:[e.jsx(xe,{allowedCategories:se,onNodeSelect:Q,defaultExpanded:!0}),e.jsx("div",{className:"flex-1 relative",children:e.jsx(ge,{hideSidebar:!0,onNodeSelect:Q,ref:L})}),(!a||a&&j)&&e.jsxs("div",{className:`${a?"fixed inset-0 z-50 bg-white dark:bg-gray-900":"w-96 border-l border-gray-200 dark:border-gray-700"} flex flex-col`,children:[a&&e.jsxs("div",{className:"flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700",children:[e.jsx("h3",{className:"font-bold text-gray-800 dark:text-gray-200",children:"3D Просмотр"}),e.jsx("button",{className:"p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300",onClick:()=>m(!1),children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"flex-1 p-4 overflow-y-auto",children:[!a&&e.jsx("h3",{className:"font-bold text-gray-800 dark:text-gray-200 mb-4",children:"3D Превью"}),e.jsx("div",{className:"w-full rounded bg-gray-800 flex items-center justify-center mb-4",style:{height:a?"220px":"280px"},children:e.jsx(he,{ref:E})}),e.jsx("div",{className:"mb-4",children:e.jsx(pe,{consoleOutput:n,onClear:ee,title:"Консоль симуляции",initiallyExpanded:!0,isMobile:a})}),w&&e.jsx("div",{className:"mt-2 mb-4 p-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded",children:e.jsxs("p",{className:`${a?"text-xs":"text-sm"}`,children:["Выполняется симуляция: шаг ",h]})}),e.jsxs("div",{className:"mt-2 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg",children:[e.jsxs("div",{className:"flex items-center mb-2",children:[e.jsx(fe,{className:"h-4 w-4 text-yellow-600 dark:text-yellow-500 mr-2"}),e.jsx("h4",{className:`${a?"text-xs":"text-sm"} font-medium text-yellow-800 dark:text-yellow-400`,children:"Отладочные функции"})]}),e.jsx("button",{className:`w-full mb-2 p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded ${a?"text-xs":"text-sm"}`,onClick:te,children:"Быстрое сохранение"}),e.jsxs("div",{className:"flex mb-2",children:[e.jsxs("select",{className:`flex-grow p-1.5 ${a?"text-xs":"text-sm"} bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l`,value:S,onChange:r=>P(r.target.value),children:[e.jsx("option",{value:"",children:"Выберите сохранение..."}),F.map(r=>e.jsx("option",{value:r,children:r},r))]}),e.jsx("button",{className:`p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-r ${a?"text-xs":"text-sm"}`,onClick:ie,disabled:!S,children:"Загрузить"})]}),e.jsx("button",{className:`w-full p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded ${a?"text-xs":"text-sm"}`,onClick:()=>{s(),b("Позиция игрока сброшена в исходное состояние","info")},children:"Сбросить позицию игрока"})]})]}),e.jsx("div",{className:"border-t border-gray-200 dark:border-gray-700 p-4",children:w?e.jsx("button",{className:`w-full p-2 bg-red-500 hover:bg-red-600 text-white rounded ${a?"text-xs":"text-sm"}`,onClick:O,children:"Остановить симуляцию"}):e.jsx("button",{className:`w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded ${a?"text-xs":"text-sm"}`,onClick:Z,children:"Запустить симуляцию"})})]})]})})]})},"level-walkthrough-scene3d")};function Oe({}){return[{title:"Образовательная платформа"},{name:"description",content:"Проходи и управляй образовательными курсами"}]}const We=ae(function(){return e.jsx(we,{children:e.jsx(Ee,{})})});export{We as default,Oe as meta};
