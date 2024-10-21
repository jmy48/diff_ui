import React, { useEffect, useState, useRef } from 'react';
import { GameScreen } from './GameScreen';
import StatusBar from './WsStatusBar'; // Import the StatusBar component

export function connect(inputWsUrl: string,
  wsRef: React.MutableRefObject<WebSocket | null>,
  setConnectedWsUrl: React.Dispatch<React.SetStateAction<string | null>>,
  setGames: React.Dispatch<React.SetStateAction<any[]>>,
  setPong: React.Dispatch<React.SetStateAction<any>>) {

  var websocket = new WebSocket(inputWsUrl);
  var pingInterval: NodeJS.Timeout;
  websocket.onopen = () => {
    // console.log("setConnectedWsUrl 1: ", inputWsUrl);
    setConnectedWsUrl(inputWsUrl);
    wsRef.current?.close();
    wsRef.current = websocket!

    // Start a "ping" every second
    pingInterval = setInterval(() => {
      websocket.send(
        JSON.stringify({
          ping: Date.now(),
        })
      );
    }, 1000);
  };

  websocket.onmessage = (event: any) => {
    let data;
    if (typeof event.data === "string") {
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    } else {
      data = event.data;
    }

    if (data.action === 'league') {
      setGames(data.games);
    } else if (data.action === 'pong') {
      setPong(data);
    }
  };

  websocket.onclose = (event) => {
    clearInterval(pingInterval!);
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      setConnectedWsUrl(null);
      connect(inputWsUrl, wsRef, setConnectedWsUrl, setGames, setPong);
    }
  };
};

const App: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [pong, setPong] = useState<any>();
  const [selectedLeague, setSelectedLeague] = useState<string>("");

  const [inputWsUrl, setInputWsUrl] = useState<string>("ws://localhost:8080");
  const [connectedWsUrl, setConnectedWsUrl] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED || inputWsUrl !== connectedWsUrl) {
      try {
        connect(inputWsUrl, wsRef, setConnectedWsUrl, setGames, setPong);
      } catch (error) {}
    }
  }, [inputWsUrl]);

  const handleLeagueSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = event.target.value;
    setSelectedLeague(selectedKey);
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ league: selectedKey }));
    }
  };

  games.sort((a, b) => {
    const num_alive_diff = Object.keys(b.book_detection_spans).length - Object.keys(a.book_detection_spans).length
    if (num_alive_diff === 0) {
      return a.first_detected - b.first_detected
    }
    return num_alive_diff;
  })

  return (
    <div className="bg-[#05131F] text-gray-200 w-full h-full min-w-screen min-h-screen">
      <StatusBar
        inputWsUrl={inputWsUrl}
        setInputWsUrl={setInputWsUrl}
        connectedWsUrl={connectedWsUrl}
        pong={pong}
      />
      <select
        id="league-select"
        onChange={handleLeagueSelection}
        className="bg-black m-4"
        value={selectedLeague || ''}
      >
        <option value="" disabled>
          league
        </option>
        {["nba", "mlb", "nfl", "esports"]
          .map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
      </select>
      {games && 
        games.map((game) => <GameScreen game={game} weak={"betonline"}></GameScreen>)
      }
    </div>
  );
};

export default App;
