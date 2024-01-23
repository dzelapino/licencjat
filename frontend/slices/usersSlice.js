import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    usersState: [],
};

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsersState: (state, action) => {
            state.usersState = action.payload
        },
        addUsersToState: (state, action) => {
            state.usersState = [...state.usersState, action.payload]
        },
        toggleUserStatus: (state, action) => {
            const pageIndex = state.usersState.findIndex(userPage => userPage.page === action.payload.page)
            const userIndex = state.usersState[pageIndex].usersList.findIndex(user => user._id === action.payload.id)
            state.usersState[pageIndex].usersList[userIndex].disabled = !state.usersState[pageIndex].usersList[userIndex].disabled
        }
    }
})

export const { setUsersState, addUsersToState, toggleUserStatus } = usersSlice.actions;

export const selectUsersState = (state) => state.users.usersState;

export default usersSlice.reducer;