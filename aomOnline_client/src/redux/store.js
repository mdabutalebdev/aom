import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// Feature slices are registered here.
export default configureStore({
  reducer: {
    auth: authReducer,
  },
});
