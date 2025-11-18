// /client/src/utils/auth.js
const TOKEN_KEY = "token";
const USERNAME_KEY = "username";
const REMEMBER_KEY = "rememberMe";
const SESSION_KEY = "sessionKey";

export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY) || !!sessionStorage.getItem(TOKEN_KEY);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const setToken = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(REMEMBER_KEY);
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
};

export const getUsername = () => {
  return localStorage.getItem(USERNAME_KEY) || sessionStorage.getItem(USERNAME_KEY);
};

export const setUsername = (username, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem(USERNAME_KEY, username);
  } else {
    sessionStorage.setItem(USERNAME_KEY, username);
  }
};

export const removeUsername = () => {
  localStorage.removeItem(USERNAME_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
};

export const getSessionKey = () => {
  return localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
};

export const setSessionKey = (sessionKey, rememberMe = false) => {
  if (!sessionKey) return;
  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, sessionKey);
  } else {
    sessionStorage.setItem(SESSION_KEY, sessionKey);
  }
};

export const removeSessionKey = () => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

export const logout = () => {
  removeToken();
  removeUsername();
  removeSessionKey();
};

export const isRememberMe = () => {
  return localStorage.getItem(REMEMBER_KEY) === "true";
};

export const clearStoredAuth = logout;

export const AUTH_EXPIRED_EVENT = "authExpired";
