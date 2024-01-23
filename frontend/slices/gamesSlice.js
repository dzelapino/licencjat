import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    gamesState: [],
};

export const gamesSlice = createSlice({
    name: 'games',
    initialState,
    reducers: {
        setGamesState: (state, action) => {
            state.gamesState = action.payload
        },
        addGamesToState: (state, action) => {
            state.gamesState = [...state.gamesState, action.payload]
        },
        deleteGameFromState: (state, action) => {
            const pageIndex = state.gamesState.findIndex(gamePage => gamePage.page === action.payload.page)
            state.gamesState[pageIndex].gamesList = state.gamesState[pageIndex].gamesList.filter(game => game._id !== action.payload.id)
        }
    }
})

export const { setGamesState, addGamesToState, deleteGameFromState } = gamesSlice.actions;

export const selectGamesState = (state) => state.games.gamesState;

export default gamesSlice.reducer;