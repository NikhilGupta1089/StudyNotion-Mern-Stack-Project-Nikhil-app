import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    token: sessionStorage.getItem("token") ? JSON.parse(sessionStorage.getItem("token")): null,
    signupData: null,
    loading: false,
}

const authSlice = createSlice({
    name:"auth",
    initialState: initialState,
    reducers: {
        setToken(state, value) {
            state.token = value.payload;
        },
        setSignupData(state, value) {
            state.signupData = value.payload;
       },
        setLoading(state, value) {
            state.loading = value.payload;
       },
    },
});

export const { setSignupData, setLoading, setToken } = authSlice.actions;

export default authSlice.reducer;