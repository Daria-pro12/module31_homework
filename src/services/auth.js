import { appState } from "../app";
import { User } from "../models/User";
import { getFromStorage } from "../utils";

export const authUser = function (login, password) {
  const user = new User(login, password);
  if (!user.hasAccess) return false;
  appState.currentUser = user;

  const users = getFromStorage("users");
  const isAdmin = users.find(
    (u) => u.login === login && u.password === password && u.isAdmin
  );
  if (isAdmin) {
    appState.currentUser = user;
    appState.isAdmin = true; // администратор
  } else {
    appState.currentUser = user;
    appState.isAdmin = false; // пользователь
  }

  return true;
};
