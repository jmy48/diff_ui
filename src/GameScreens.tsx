import React from "react";
import GameScreen from "./GameScreen";

function GameScreens(props: any) {
    const {games, weak, setSelectedOutcome, selectedOutcome, setSelectedPrice} = props;

    return games.map((game: any) => 
        <GameScreen 
            game={game} 
            weak={weak}
            setSelectedOutcome={setSelectedOutcome}
            selectedOutcome={selectedOutcome}
            setSelectedPrice={setSelectedPrice}
        />)
}

export default React.memo(GameScreens)