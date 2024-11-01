import React, { useEffect, useState, useRef } from 'react';
import StatusBar from './WsStatusBar'; // Import the StatusBar component
import Betslip, { Outcome, Price } from './Betslip';
import GameScreens from './GameScreens';
import BetsTable from './BetsTable';

export function connect(inputWsUrl: string,
  wsRef: React.MutableRefObject<WebSocket | null>,
  setConnectedWsUrl: React.Dispatch<React.SetStateAction<string | null>>,
  setGames: React.Dispatch<React.SetStateAction<any[]>>,
  setPong: React.Dispatch<React.SetStateAction<any>>,
  setBetslipStatus: React.Dispatch<React.SetStateAction<string>>,
  setBetslipResult: React.Dispatch<React.SetStateAction<string>>,
  setBets: React.Dispatch<React.SetStateAction<any[]>>
) {

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
    } else if (data.action === 'bet_result') {
      setBetslipResult(data.result);
      setBetslipStatus("Ready");
    } else if (data.action === 'bets') {
      console.log(data.bets);
      setBets(data.bets)
    }
  };

  websocket.onclose = (event) => {
    clearInterval(pingInterval!);
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      setConnectedWsUrl(null);
      connect(inputWsUrl, wsRef, setConnectedWsUrl, setGames, setPong, setBetslipStatus, setBetslipResult, setBets);
    }
  };
};

const App: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [pong, setPong] = useState<any>();
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [selectedWeak, setSelectedWeak] = useState<string>("betonline");
  const [bets, setBets] = useState<any[]>([]);

  const [inputWsUrl, setInputWsUrl] = useState<string>("ws://localhost:8080"); // wss://diffui.duckdns.org
  const [connectedWsUrl, setConnectedWsUrl] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [betslipStatus, setBetslipStatus] = useState<string>("Ready"); // "Ready" or "Betting {x}"
  const [betslipResult, setBetslipResult] = useState<string>(""); // ""

  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED || inputWsUrl !== connectedWsUrl) {
      try {
        connect(inputWsUrl, wsRef, setConnectedWsUrl, setGames, setPong, setBetslipStatus, setBetslipResult, setBets);
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

  const sendSignal = (size: number) => {
    if (!wsRef.current) {
      setBetslipResult("Autobettor not connected.");
      return;
    }
    if (!selectedOutcome || !selectedPrice) {
      setBetslipResult("Outcome not selected.");
      return;
    }
    wsRef.current.send(JSON.stringify({
      signal: {book: selectedOutcome.book,
      game_id: selectedOutcome.game_id,
      market: selectedOutcome.market,
      outcome_index: selectedOutcome.outcome_index,
      price: selectedPrice,
      size: size,
      ts: Date.now()
    }}))
    setBetslipStatus(`...`)
  }

  return (
    <div className="bg-[#05131F] text-gray-200 w-full h-full min-w-screen min-h-screen">
      <StatusBar
        inputWsUrl={inputWsUrl}
        setInputWsUrl={setInputWsUrl}
        connectedWsUrl={connectedWsUrl}
        pong={pong}
      />
      <Betslip
        selectedOutcome={selectedOutcome}
        selectedPrice={selectedPrice}
        betslipStatus={betslipStatus}
        betslipResult={betslipResult}
        setBetslipResult={setBetslipResult}
        sendSignal={sendSignal}
      />
      <BetsTable
        bets={bets}
      />
      <div className="flex flex-row">
        <select
          id="league-select"
          onChange={handleLeagueSelection}
          className="bg-black m-4 p-1"
          value={selectedLeague || ''}
        >
          <option value="" disabled>
            league
          </option>
          {["nba", "mlb", "nfl", "esports", "mexico_lmb"]
            .map((league) => (
              <option key={league} value={league}>
                {league}
              </option>
            ))}
        </select>
        <select
          onChange={(event) => setSelectedWeak(event.target.value)}
          className="bg-black m-4 p-1"
          value={selectedWeak || ''}
        >
          <option value="" disabled>
            weak
          </option>
          {["betonline", "betcris", "bovada", "fanduel", "pinnacle", "bet365", "caesars"]
            .map((league) => (
              <option key={league} value={league}>
                {league}
              </option>
            ))}
        </select>
      </div>
      {games && <GameScreens
        games={games}
        weak={selectedWeak}
        setSelectedOutcome={setSelectedOutcome}
        selectedOutcome={selectedOutcome}
        setSelectedPrice={setSelectedPrice}
      />}
    </div>
  );
};

export default App;
