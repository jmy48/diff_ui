import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { displayGame, displayOutcome, formatPrice } from './utils';

function GameScreen(props: any) {
    const { game, weak, setSelectedOutcome, selectedOutcome, setSelectedPrice } = props;

    const handleCellClick = (params: any) => {
        // console.log('Clicked cell:', params);
        // console.log('Row data:', params.row);
        // console.log('Column:', params.field);
        // console.log('Cell value:', params.value);

        const price = params.row[params.field].price;
        if (price.odds === 0 || price.status === "offline") {
            return;
        }
        const market = params.field.slice(0, -1)
        const outcome_index = (params.field.slice(-1) === '1') ? 0 : 1

        // get display str:
        var outcome = displayOutcome(market, game.id, outcome_index);

        setSelectedOutcome({
            book: params.id,
            game_id: game.id,
            market: market,
            outcome_index: outcome_index,
            display: `(${params.id}) ${outcome}`
        })

        setSelectedPrice(price)
    };

    var cols: GridColDef[] = [
        { field: 'book', headerName: 'Book', width: 150, cellClassName: (params) => {
            return params.value.includes(weak) ? 'weak-cell' : '';
        }},
        // { field: 'detected', headerName: 'Detected(s)', width: 150 },
        // { field: 'spans', headerName: 'spans', width: 150 },
    ];

    const markets = ["moneyline", "spread", "total"]

    for (const market of markets) {
        for (const i of [1,2]) {
            const field = `${market}${i}`;
            cols.push({ field: field, headerName: field, width: 150,
                cellClassName: (params: any) => {
                    return params.row[field]?.className;
                },
                valueGetter: (params: any) => {
                    return params.display;
                }
            })
        }
    }

    // Prepare rows
    const rows: any[] = [];

    const base_markets = new Map(
        markets.map((market) => {
            return [market, game.markets[market]!];
        })
    );

    const comparison_book = weak;

    for (const [book, detection_spans] of Object.entries(game.book_detection_spans)) {
        const spans = (detection_spans as any).spans;

        const lastSpan = spans[spans.length - 1]
        const detectedStr = (!lastSpan) ? '?' : ((Date.now() - lastSpan.end) / 1000).toFixed(1)

        const row: any = {
            id: book,  // Make sure each row has a unique 'id' field
            book: `${book} (${detectedStr}s)`,
            // spans: allSpansStr
        };

        for (const [market_id, market] of base_markets.entries()) {
            if (!market) {
                continue;
            }

            const prices1 = market.prices1;
            const prices2 = market.prices2;
            if (!(book in prices1)) continue;

            const bookprices1 = prices1[book]!;
            const bookprices2 = prices2[book]!;

            const price1 = bookprices1[bookprices1.length - 1]
            const price2 = bookprices2[bookprices2.length - 1]

            // console.log(selectedOutcome.game_id, game.id, selectedOutcome.book, book, selectedOutcome.market, market_id);

            if (selectedOutcome 
                && selectedOutcome.game_id === game.game_id 
                && selectedOutcome.book === book
                && selectedOutcome.market === market_id
            ) {
                if (selectedOutcome.outcome_index === 0) {
                    setSelectedPrice(price1)
                } else {
                    setSelectedPrice(price2)
                }
            }

            var className1, className2;
            if (comparison_book in prices1) {
                const comparison_prices1 = prices1[comparison_book]!
                const comparison_prices2 = prices2[comparison_book]!
                const comparison_price1 = comparison_prices1[comparison_prices1.length - 1]
                const comparison_price2 = comparison_prices2[comparison_prices2.length - 1]

                if (market_id === "moneyline") {
                    className1 = comparePrices(comparison_price1, price2)
                    className2 = comparePrices(comparison_price2, price1)
                } else {
                    className1 = comparePrices(comparison_price1, price1)
                    className2 = comparePrices(comparison_price2, price2)
                }
            }

            row[`${market_id}1`] = {
                display: formatPrice(price1),
                className: className1,
                price: price1
            };
            row[`${market_id}2`] = {
                display: formatPrice(price2),
                className: className2,
                price: price2
            };
        }

        rows.push(row);
    }

    rows.sort((row1, row2) => (row1.id > row2.id) ? 1 : 0)

    const index = rows.findIndex(row => row.id === weak);
    if (index !== -1) {
        const [matchingRow] = rows.splice(index, 1); // Remove the found row from the array
        rows.unshift(matchingRow); // Add the removed row to the beginning of the array
    }

    const dark = "#05131F"
    const light = "white"

    return (
        <div className={`text-gray-200 bg-[${dark}] my-4`}>
            <p className="px-4">{displayGame(game.id)}</p>
            <DataGrid rows={rows} columns={cols} getRowHeight={() => 'auto'} hideFooter autoHeight
                onCellClick={(params) => handleCellClick(params)}  // Add the event handler here
                sx={{
                    '& .MuiDataGrid-root': {
                        color: light,  // Text color
                        backgroundColor: dark,  // Background color
                    },
                    '& .MuiDataGrid-filler': {
                        backgroundColor: dark,  // Set the background color for filler to dark
                    },
                    '& .MuiDataGrid-cell': {
                        color: light,  // Text color for cells
                    },
                    '& .MuiDataGrid-cell:hover': {
                        backgroundColor: '#5d9c6e',  // Cell background color on hover
                        cursor: 'pointer'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: dark,  // Darker background for headers
                        // color: 'white',  // White text for headers
                    },
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: dark,  // Background color for each header cell
                        color: light,  // White text for header cells
                    },
                    '& .MuiDataGrid-row': {
                        backgroundColor: dark,  // Background for rows
                        '&:hover': {
                            backgroundColor: '#444',  // Background color on hover
                        },
                    },
                    '& .weak-cell': {
                        backgroundColor: '#0088FF',
                    },
                    '& .red': {
                        backgroundColor: '#AC0000',
                    },
                    '& .orange': {
                        backgroundColor: '#CC6600',
                    },
                    '& .yellow': {
                        backgroundColor: '#9A8F01',
                    },
                    '& .green': {
                        backgroundColor: '#017004',
                    },
                    '& .blue': {
                        backgroundColor: '#07B284',
                    },
                }}/>
        </div>
    );
}

// price1 and price2 are guaranteed to be the same outcome (spread1, total2, etc...)
function comparePrices(weak_price: any, strong_price: any): string {
    var point_diff = 0;
    var arb = -1.0;
    if ((strong_price.status === "offline") || (weak_price.status === "offline") || !strong_price.odds || !weak_price.odds) {
        return "-";
    }

    if (strong_price.spread_handicap) {
        if (weak_price.spread_handicap.plus) {
            point_diff = weak_price.spread_handicap.handicap - strong_price.spread_handicap.handicap
        } else {
            point_diff = strong_price.spread_handicap.handicap - weak_price.spread_handicap.handicap
        }
    } else if (strong_price.totals_handicap) {
        if (strong_price.totals_handicap.over) {
            point_diff = strong_price.totals_handicap.handicap - weak_price.totals_handicap.handicap
        } else {
            point_diff = weak_price.totals_handicap.handicap - strong_price.totals_handicap.handicap
        }
    } else {
        arb = arb_diff(weak_price.odds, strong_price.odds);
        // console.log(weak_price.odds, strong_price.odds, arb);
    }

    // const value = calculatePossibleValue(weak_price.odds, strong_price.odds)
    if (point_diff >= 3) {
        return "red"
    }
    if (point_diff === 2.5) {
        return "orange"
    }
    if (point_diff === 2) {
        return "yellow"
    }
    if (point_diff === 1.5) {
        return "green"
    }
    if (point_diff === 1) {
        return "blue"
    }

    if (arb > .1) {
        return "red"
    }
    if (arb > .05) {
        return "orange"
    }
    if (arb > 0) {
        return "yellow"
    }
    return "";
}



export function american_to_decimal(odds: number) {
    if (odds > 0) {
        return 1 + (odds / 100)
    } else {
        return 1 + (100 / Math.abs(odds))
    }
}

export function arb_diff(a: number, b: number) {
    return (american_to_decimal(a) - 1) * (american_to_decimal(b) - 1) - 1
}


export default React.memo(GameScreen);