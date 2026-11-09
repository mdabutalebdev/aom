"use client";

import store from "@/redux/store";
import React, { useEffect } from "react";
import { Provider } from "react-redux";

import { hydrateAuth } from "@/redux/authSlice";

const ReduxProviderWrapper = ({ children }) => {
  // Restore the cached user after mount, never during render — the store's
  // initial state has to match what the server rendered or React throws a
  // hydration mismatch on any component showing the user's name/role.
  useEffect(() => {
    store.dispatch(hydrateAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProviderWrapper;
