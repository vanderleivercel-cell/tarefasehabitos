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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Por favor, digite seu email primeiro.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      alert("Um link de recuperação foi enviado para o seu email. Por favor, cheque sua caixa de entrada (e a de spam).");
      setIsResetting(false);
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

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
        const { data, error } = await supabase.auth.signUp({
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

        if (data.user) {
          // Criar o profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { id: data.user.id, email: data.user.email, name: name, whatsapp: whatsapp, role: 'user', status: 'pending' }
            ]);
          
          if (profileError) throw profileError;
        }

        alert('Cadastro realizado com sucesso! Finalize o pagamento para liberar seu acesso.');
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
      alert(msg);
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

        <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                if (isResetting) {
                  setIsResetting(false);
                } else {
                  setIsLogin(!isLogin);
                }
              }}
              className="text-sm text-gray-400 hover:text-gold-primary transition-colors font-mono"
            >
              {isResetting 
                ? 'Voltar para o Login' 
                : isLogin 
                  ? 'Não tem uma conta? Cadastre-se' 
                  : 'Já tem uma conta? Faça Login'}
            </button>
        </div>
      </div>
    </div>
  );
}
