import { createContext, useContext, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  username: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("token"),
  );

  const [username, setUsername] = useState<string | null>(
    sessionStorage.getItem("username"),
  );

  const login = (token: string, username: string) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);

    setUsername(username);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");

    setUsername(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext)!;
}
