import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              whatsapp,
            }
          }
        });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lux-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-lux-card/80 border border-lux-border rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md">
        
        <div className="flex flex-col items-center mb-8">
          <img src="/logomarca-atual.png" alt="Tarefas e Hábitos Logo" className="h-20 w-auto object-contain mb-4" />
          <h2 className="font-serif-lux text-2xl font-bold text-white uppercase tracking-widest text-center">
            {isLogin ? 'Acesse sua Conta' : 'Crie sua Conta'}
          </h2>
          <p className="text-gray-400 mt-2 text-center text-sm font-mono">
            O seu universo particular de foco e disciplina.
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-serif-lux uppercase tracking-widest text-gold-primary mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-lux-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all font-mono"
                  placeholder="Seu Nome"
                />
              </div>

              <div>
                <label className="block text-xs font-serif-lux uppercase tracking-widest text-gold-primary mb-2">WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-black/50 border border-lux-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all font-mono"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-serif-lux uppercase tracking-widest text-gold-primary mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-lux-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all font-mono"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-serif-lux uppercase tracking-widest text-gold-primary mb-2">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-lux-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all font-mono"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 gold-gradient-bg text-black font-bold uppercase tracking-widest py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isLogin ? (
              <><LogIn size={20} /> Entrar</>
            ) : (
              <><UserPlus size={20} /> Cadastrar</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-gold-primary transition-colors font-mono"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
