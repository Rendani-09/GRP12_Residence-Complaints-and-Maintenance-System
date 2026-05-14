import { createContext, useContext, useState, type ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { mockStudentUser, mockAdminUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  loginAsRole: (role: UserRole) => void;
  signup: (data: { studentNumber: string; firstName: string; surname: string; email: string; password: string }) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string): boolean => {
    if (email.includes('admin')) {
      setUser(mockAdminUser);
    } else {
      setUser(mockStudentUser);
    }
    return true;
  };

  const loginAsRole = (role: UserRole) => {
    if (role === 'admin') setUser(mockAdminUser);
    else setUser(mockStudentUser);
  };

  const signup = (data: { studentNumber: string; firstName: string; surname: string; email: string; password: string }): boolean => {
    setUser({
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      surname: data.surname,
      studentNumber: data.studentNumber,
      role: 'student',
    });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, loginAsRole, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
