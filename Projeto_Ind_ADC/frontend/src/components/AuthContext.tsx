import { createContext, useContext, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  username: string | null;
  role: string | null;
  email: string | null;
  login: (token: string, username: string, role: string, email: string) => void;
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

  const [role, setRole] = useState<string | null>(
    sessionStorage.getItem("role"),
  );

  const [email, setEmail] = useState<string | null>(
    sessionStorage.getItem("email"),
  );

  const login = (
    token: string,
    username: string,
    role: string,
    email: string,
  ) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("email", email);

    setUsername(username);
    setRole(role);
    setEmail(email);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");

    setUsername(null);
    setRole(null);
    setEmail(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        role,
        email,
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
