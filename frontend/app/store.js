import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import usersReducer from "../slices/usersSlice";
import gamesReducer from "../slices/gamesSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: usersReducer,
        games: gamesReducer,
    },
});
