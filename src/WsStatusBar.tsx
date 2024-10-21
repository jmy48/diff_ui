import React from 'react';

interface StatusBarProps {
  inputWsUrl: string;
  setInputWsUrl: (url: string) => void;
  connectedWsUrl: string | null;
  pong: any;
}


const StatusBar: React.FC<StatusBarProps> = ({ inputWsUrl, setInputWsUrl, connectedWsUrl, pong }) => {
    // console.log("StatusBar connectedWsUrl: ", connectedWsUrl);
  return (
    <div className="bg-gray-800 p-4 flex items-center">
      <input
        type="text"
        value={inputWsUrl}
        onChange={(e) => {setInputWsUrl(e.target.value)}}
        placeholder="WebSocket URL"
        className="bg-gray-700 text-white px-4 py-2 rounded-l-md focus:outline-none"
      />
      <p
        className={`ml-4 text-sm ${
          connectedWsUrl ? 'text-green-400' : 'text-yellow-400 animate-pulse'
        }`}
      >
        {connectedWsUrl ? `Connected to: ${connectedWsUrl}` : 'Connecting...'}
      </p>
      <p
        className={`ml-4 text-sm text-green-300`}
      >
        {pong ? `[PING ${Date.now() - pong.ping_ts}ms]` : ''}
      </p>
    </div>
  );
};

export default StatusBar;
