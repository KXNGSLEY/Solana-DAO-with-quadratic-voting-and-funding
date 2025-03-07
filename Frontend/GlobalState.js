import { atom } from "recoil";

export const walletState = atom({
  key: "walletState",
  default: null,
});

export const daoDataState = atom({
  key: "daoDataState",
  default: {},
});
