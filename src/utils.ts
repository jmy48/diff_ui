export function capitalize(str: string): string {
    if (!str) return str; // Handle empty string or undefined/null values
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}  

export function displayGame(game_id: string) {
    const tokens = game_id.split("__");
    const comp1_tokens = tokens[0].split("_")
    const comp2_tokens = tokens[1].split("_")
    const comp1 = comp1_tokens[comp1_tokens.length - 1]
    const comp2 = comp2_tokens[comp2_tokens.length - 1]
    return `${capitalize(comp1)} vs. ${capitalize(comp2)}`
}

export function formatPrice(price: any) {
    if (!price) {
        return "-";
    }

    var ago_str;
    const seconds_ago = Math.floor((Date.now() - price.timestamp) / 1000)
    if (seconds_ago > 60) {
        ago_str = `${(seconds_ago / 60).toFixed(1)}m`
    } else {
        ago_str = `${seconds_ago}s`
    }

    if (price.spread_handicap) {
        const hcap = (price.spread_handicap.plus ? '+' : '-') + price.spread_handicap.handicap;
        return `(${ago_str}) ${hcap} ${price.odds}`
    } else if (price.totals_handicap) {
        const hcap = (price.totals_handicap.over ? 'O' : 'U') + price.totals_handicap.handicap;
        return `(${ago_str}) ${hcap} ${price.odds}`
    } else{
        return `(${ago_str}) ${price.odds}`
    }
}

export function displayOutcome(market: string, game_id: string, outcome_index: number) {
    if (market === "moneyline" || market === "spread") {
        const comp_tokens = game_id.split("__")[outcome_index].split(",")
        return comp_tokens[comp_tokens.length - 1]
    } else {
        return displayGame(game_id);
    }
}

export function displayBetOutcome(market: string, game_id: string, outcome_index: number) {
    if (market === "moneyline" || market === "spread") {
        const comp_tokens = game_id.split("__")[outcome_index].split(",")
        return comp_tokens[comp_tokens.length - 1]
    } else {
        return ["Over", "Under"][outcome_index];
    }
}