import React, { createContext, useState, useContext, useEffect } from 'react';
import { username as Username } from '@/scripts/username';
import { user as User } from '@/scripts/user';
import { token as Token } from '@/scripts/token';
import { moderator as Moderator } from '@/scripts/moderator';
import checkValidToken from '@/scripts/checkValidToken';

interface AuthContextType {
  user: string | null;
  setUserAs: (user: string | null) => void;
  username: string | null;
  setUsernameAs: (username: string | null) => void;
  token: string | null;
  setTokenAs: (token: string | null) => void;
  moderator: string | null;
  setMod: (m: string | null) => void;
  loading: boolean;
}

// 1. Initialize Context
const AuthContext = createContext<AuthContextType | null>(null);
/*
const savedUser = await User.getData();
const savedToken = await Token.getData();
const savedUsername = await Username.getData();
const savedModerator = await Moderator.getData();
*/

// 2. Create the Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [moderator, setModerator] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount (e.g., from localStorage)
  useEffect(() => {
    const loadData = async () => {
      const savedUser = await User.getData();
      const savedToken = await Token.getData();
      const savedUsername = await Username.getData();
      const savedModerator = await Moderator.getData();
      if (savedUser) { setUser(savedUser) };
      if (savedToken) { setToken(savedToken) };
      if (savedUsername) { setUsername(savedUsername) };
      if (savedModerator) { setModerator(savedModerator) };

      if (token) {
        await checkValidToken(token)
          .catch(() => {
            console.log("E");
            setUsernameAs(null);
            setTokenAs(null);
            setUserAs(null);
            setMod(null);
          })
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const setMod = (m: string | null) => {
    setModerator(m);
    if (m === null) {
      Moderator.removeData();
    }
    else {
      Moderator.storeData(m);
    }
  }

  const setUserAs = (user: string | null) => {
    setUser(user);
    if (user === null) {
      User.removeData();
    }
    else {
      User.storeData(user);
    }
  }

  const setUsernameAs = (username: string | null) => {
    setUsername(username);
    if (username === null) {
      Username.removeData();
    }
    else {
      Username.storeData(username);
    }
  }

  const setTokenAs = (token: string | null) => {
    setToken(token);
    if (token === null) {
      Token.removeData();
    }
    else {
      Token.storeData(token);
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUserAs, username, setUsernameAs, token, setTokenAs, moderator, setMod, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook for consuming the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
