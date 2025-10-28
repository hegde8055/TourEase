// /client/src/utils/auth.js
export const isAuthenticated = () => {
  return !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

export const setToken = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem("token", token);
    localStorage.setItem("rememberMe", "true");
  } else {
    sessionStorage.setItem("token", token);
  }
};

export const removeToken = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  localStorage.removeItem("rememberMe");
};

export const getUsername = () => {
  return localStorage.getItem("username") || sessionStorage.getItem("username");
};

export const setUsername = (username, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem("username", username);
  } else {
    sessionStorage.setItem("username", username);
  }
};

export const removeUsername = () => {
  localStorage.removeItem("username");
  sessionStorage.removeItem("username");
};

export const logout = () => {
  removeToken();
  removeUsername();
};

export const isRememberMe = () => {
  return localStorage.getItem("rememberMe") === "true";
};
