import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Mail, ArrowRight, Zap } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('AUTHORITY');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="w-full min-h-screen bg-[#030712] flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl space-y-5 border-cyan-500/30 shadow-cyan-glow">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center mx-auto text-cyan-400 shadow-cyan-glow">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="font-extrabold text-lg text-white uppercase tracking-wider">
            {isRegister ? 'REGISTER OPERATOR' : 'AUTHORITY LOGIN'}
          </h2>
          <p className="text-xs text-slate-400">JALDRISHTI X DISASTER CONTROL PORTAL</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 block mb-1">OFFICIAL EMAIL</label>
            <div className="flex items-center gap-2 bg-dark-900 border border-slate-700 rounded-lg px-3 py-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@jaldrishti.gov.in"
                className="bg-transparent text-white outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">SECURE ACCESS KEY</label>
            <div className="flex items-center gap-2 bg-dark-900 border border-slate-700 rounded-lg px-3 py-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-transparent text-white outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">ROLE SELECTION</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-dark-900 border border-slate-700 rounded-lg p-2 text-white outline-none"
            >
              <option value="AUTHORITY">DISASTER AUTHORITY</option>
              <option value="OPERATOR">CONTROL ROOM OPERATOR</option>
              <option value="ANALYST">GIS / AI ANALYST</option>
              <option value="CITIZEN">CITIZEN</option>
              <option value="ADMIN">SYSTEM ADMIN</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-extrabold text-xs rounded-lg shadow-cyan-glow uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>{isRegister ? 'CREATE ACCOUNT' : 'ENTER DISASTER CONTROL'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-cyan-400 hover:underline"
          >
            {isRegister ? 'Already have credentials? Sign In' : 'Need new operator access? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};
