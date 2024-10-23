import React from 'react';
import { Button, TextField } from '@mui/material';


export type Outcome = {
  book: string,
  game_id: string,
  market: string,
  outcome_index: number,  // 0 or 1
  display: string
}

export type Price = {
  odds: Number,
  status: "offline" | "online",
  spread_handicap?: { plus: boolean, handicap: number },
  totals_handicap?: { over: boolean, handicap: number },
  ts: Number
}

export function priceToString(price: Price) {
  var s = ""
  if (price.spread_handicap) {
      const hcap = (price.spread_handicap.plus ? '+' : '-') + price.spread_handicap.handicap;
      s = `${hcap} ${price.odds}`
  } else if (price.totals_handicap) {
      const hcap = (price.totals_handicap.over ? 'O' : 'U') + price.totals_handicap.handicap;
      s = `${hcap} ${price.odds}`
  } else{
      s = `${price.odds}`
  }
  return s
}

/**
 * Things inside Betslip:
 * 
 * current betting status: "ready" | "betting {bet}..." | "{bet} {result}"
 * current selected bet: "{bet}"
 * size input
 * confirm button
 * 
 * bet string: {outcome} {handicap} {price}
 * 
 * click on cell: => setSelectedOutcome and setSelectedPrice
 * every Game render also setSelectedPrice 
 */
export function Betslip(props: any) {
  const [size, setSize] = React.useState<number>(10);
  const [prevBet, setPrevBet] = React.useState<string>("");
  const { selectedOutcome, selectedPrice, betslipStatus, betslipResult, setBetslipResult, sendSignal } = props;

  const handleSubmit = () => {
    setPrevBet(`${selectedOutcome.display} ${priceToString(selectedPrice)}`)
    setBetslipResult("Betting...")
    sendSignal(size);
  }

  return (
    <div className="bg-stone-900 space-y-2 p-2 flex-1 items-center fixed top-0 left-[75vw] z-50 rounded-b-lg">
      <div className="flex flex-row mb-2">
        {/* <p className={`text-sm text-green-100`}>betslip</p> */}
        <p className={`text-sm text-green-200`}>{`[${betslipStatus}]`}</p>
        <p className={`pl-2 text-sm text-green-200`}>
        {selectedOutcome ? 
          `${selectedOutcome.display} ${priceToString(selectedPrice)}` : '[--]'}
        </p>
      </div>
      {/** Add a "submit" button that calls sendSignal(size). also add an input that controls a size state variable defined in betslip */} 
      <div className="flex flex-row space-x-2">
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={betslipStatus !== "Ready" || size < 0 || !selectedOutcome || selectedOutcome.book !== "betonline"}
          sx={{
            backgroundColor: '#16a34a', // Tailwind's blue-500
            minWidth: 'auto',
            color: 'white',
            '&:hover': {
              backgroundColor: '#166534', // Tailwind's blue-700
            },
            '&.Mui-disabled': {
              backgroundColor: '#9ca3af', // Tailwind's gray-400
              color: '#6b7280',          // Tailwind's gray-600
            },
          }}
        >
          {"x"}
        </Button>
        <input
          type="text"
          value={size}
          onChange={(e) => {setSize(Number(e.target.value))}}
          placeholder="WebSocket URL"
          className="bg-gray-700 text-white px-1 focus:outline-none w-16"
        />
      </div>
      {prevBet && <p className={`text-sm text-green-200`}>{`(${prevBet}):`}</p>}
      {betslipResult && <p className={`text-sm text-green-200`}>{betslipResult}</p>}
    </div>
  );
};

export default Betslip;
