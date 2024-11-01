import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { displayBetOutcome, displayGame, formatPrice } from './utils';

const dark = "#05131F";
const light = "white";

const BetsTable: React.FC<any> = ({ bets }) => {
    // Define the columns for the DataGrid
    const columns: GridColDef[] = [
        { field: 'timestamp', headerName: '', width: 200 },
        // { field: 'book', headerName: 'Book', width: 150 },
        { field: 'game_id', headerName: 'Game', width: 200 },
        { field: 'outcome', headerName: 'Outcome', width: 150 },
        { field: 'price', headerName: 'Price', width: 170 },
        { field: 'size', headerName: 'Size', width: 50 },
    ];

    // Map your state data to the rows expected by DataGrid
    const rows = bets.map((item: any, index: any) => ({
        id: index.toString(), // DataGrid requires a unique 'id' field
        timestamp: new Date(item.ts).toLocaleString(),
        book: item.book,
        game_id: displayGame(item.game_id),
        price: formatPrice(item.price),
        outcome: displayBetOutcome(item.market, item.game_id, item.outcome_index),
        size: item.size
    }));

    return (
      <div className={`text-gray-200 bg-[${dark}] my-4`} style={{ width: 'auto' }}>
          <DataGrid
              rows={rows}
              columns={columns}
              getRowHeight={() => 'auto'}
              hideFooter
              autoHeight
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
                  '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: dark,  // Darker background for headers
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
              }}
          />
      </div>
    )
};

export default BetsTable;
