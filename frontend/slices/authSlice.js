import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    authorizedState: false,
    id: null,
    roleState: 'public',
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthorizedState: (state, action) => {
            state.authorizedState = action.payload
        },
        setId: (state, action) => {
            state.id = action.payload
        },
        setRoleState: (state, action) => {
            state.roleState = action.payload
        },
    }
})

export const { setAuthorizedState, setId, setRoleState } = authSlice.actions;

export const selectAuthorizedState = (state) => state.auth.authorizedState;
export const selectId = (state) => state.auth.id;
export const selectRoleState = (state) => state.auth.roleState;

export default authSlice.reducer;