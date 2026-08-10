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
  const [isResetting, setIsResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Por favor, digite seu email primeiro.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      setSuccessMsg("Um link de recuperação foi enviado para o seu email. Por favor, cheque sua caixa de entrada (e a de spam).");
      setIsResetting(false);
    } catch (error: any) {
      let msg = error.error_description || error.message;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
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

        setSuccessMsg('Cadastro realizado com sucesso! Finalize o pagamento para liberar seu acesso.');
        setIsLogin(true); // Switch back to login or wait for auto-login
      }
    } catch (error: any) {
      let msg = error.error_description || error.message;
      if (msg === 'Invalid login credentials') {
        msg = 'Email ou senha incorretos.';
      } else if (msg === 'User already registered') {
        msg = 'Este email já está cadastrado.';
      } else if (msg === 'Password should be at least 6 characters.') {
        msg = 'A senha deve ter no mínimo 6 caracteres.';
      }
      setErrorMsg(msg);
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
            {isResetting ? 'Recuperar Senha' : isLogin ? 'Acesse sua Conta' : 'Crie sua Conta'}
          </h2>
          <p className="text-gray-400 mt-2 text-center text-sm font-mono">
            O seu universo particular de foco e disciplina.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm font-mono text-center">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 bg-green-900/50 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm font-mono text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={isResetting ? handleReset : handleAuth} className="space-y-6">
          {!isLogin && !isResetting && (
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

          {!isResetting && (
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
          )}

          {isLogin && !isResetting && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setIsResetting(true)}
                className="text-xs text-gold-primary hover:text-white transition-colors font-mono underline decoration-gold-primary/30"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 gold-gradient-bg text-black font-bold uppercase tracking-widest py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isResetting ? (
              <>Enviar Link</>
            ) : isLogin ? (
              <><LogIn size={20} /> Entrar</>
            ) : (
              <><UserPlus size={20} /> Cadastrar</>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-lux-border/50 flex flex-col items-center w-full">
          {isResetting ? (
            <button
              type="button"
              onClick={() => setIsResetting(false)}
              className="text-sm text-gray-400 hover:text-gold-primary transition-colors font-mono"
            >
              Voltar para o Login
            </button>
          ) : isLogin ? (
            <div className="w-full flex flex-col items-center gap-3">
              <span className="text-sm text-gray-400 font-mono">Ainda não tem acesso?</span>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="w-full py-3 px-4 rounded-lg font-bold uppercase tracking-widest text-black bg-[#39FF14] hover:bg-[#32e612] transition-colors shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_25px_rgba(57,255,20,0.6)]"
              >
                Cadastre-se Agora
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="text-sm text-gray-400 hover:text-gold-primary transition-colors font-mono"
            >
              Já tem uma conta? Faça Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
