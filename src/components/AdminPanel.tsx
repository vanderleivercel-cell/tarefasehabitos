import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, User, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

type Profile = {
  id: string;
  email: string;
  name?: string;
  whatsapp?: string;
  role: 'admin' | 'user';
  status: 'pending' | 'active' | 'blocked';
  created_at: string;
};

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
      alert('Erro ao buscar usuários. Você tem permissão de Admin?');
    } else if (data) {
      setProfiles(data as Profile[]);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: Profile['status']) => {
    const updates: Partial<Profile> = { status: newStatus };
    
    // Se ativado, ganha 30 dias de acesso
    if (newStatus === 'active') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      updates.expires_at = expiresAt.toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } else {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const updateRole = async (id: string, newRole: Profile['role']) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);
    
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
    } else {
      alert('Erro ao atualizar permissão: ' + error.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center p-4 md:p-8 overflow-y-auto"
    >
      <div className="w-full max-w-5xl bg-lux-card border border-gold-primary/30 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-lux-card to-black p-6 border-b border-gold-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="text-gold-primary" size={32} />
            <div>
              <h2 className="font-serif-lux text-2xl font-bold text-white uppercase tracking-widest">
                Painel Imperial
              </h2>
              <p className="text-gray-400 font-mono text-sm">Controle de Acesso e Assinaturas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white border border-gray-600 hover:border-white px-4 py-2 rounded-lg font-mono text-sm transition-colors"
          >
            FECHAR
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-gold-primary" size={40} />
              <p className="text-gray-400 font-mono">Carregando usuários...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-lux-border">
                    <th className="p-4 text-xs font-serif-lux uppercase tracking-widest text-gold-primary">Usuário</th>
                    <th className="p-4 text-xs font-serif-lux uppercase tracking-widest text-gold-primary">Data de Cadastro</th>
                    <th className="p-4 text-xs font-serif-lux uppercase tracking-widest text-gold-primary">Privilégio</th>
                    <th className="p-4 text-xs font-serif-lux uppercase tracking-widest text-gold-primary">Assinatura</th>
                    <th className="p-4 text-xs font-serif-lux uppercase tracking-widest text-gold-primary">Expiração</th>
                    <th className="p-4 text-xs font-serif-lux uppercase tracking-widest text-gold-primary text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-b border-lux-border/50 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold-primary/20 flex items-center justify-center border border-gold-primary/50 shrink-0">
                            <User size={20} className="text-gold-primary" />
                          </div>
                          <div>
                            <span className="text-gray-200 font-mono font-bold block">{profile.name || 'Sem Nome'}</span>
                            <span className="text-gray-500 font-mono text-xs block">{profile.email}</span>
                            {profile.whatsapp && (
                              <span className="text-[#25D366] font-mono text-xs block mt-1">
                                WhatsApp: {profile.whatsapp}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-400 font-mono">
                        {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <select 
                          value={profile.role}
                          onChange={(e) => updateRole(profile.id, e.target.value as 'admin' | 'user')}
                          className={`bg-black border ${profile.role === 'admin' ? 'border-gold-primary text-gold-primary' : 'border-gray-600 text-gray-400'} rounded px-2 py-1 text-xs font-mono uppercase focus:outline-none`}
                        >
                          <option value="user">Usuário</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {profile.status === 'active' && <CheckCircle size={16} className="text-green-500" />}
                          {profile.status === 'pending' && <Clock size={16} className="text-yellow-500" />}
                          {profile.status === 'blocked' && <XCircle size={16} className="text-red-500" />}
                          
                          <select 
                            value={profile.status}
                            onChange={(e) => updateStatus(profile.id, e.target.value as 'active' | 'pending' | 'blocked')}
                            className={`bg-black border rounded px-2 py-1 text-xs font-mono uppercase focus:outline-none
                              ${profile.status === 'active' ? 'border-green-500/50 text-green-500' : ''}
                              ${profile.status === 'pending' ? 'border-yellow-500/50 text-yellow-500' : ''}
                              ${profile.status === 'blocked' ? 'border-red-500/50 text-red-500' : ''}
                            `}
                          >
                            <option value="pending">Pendente</option>
                            <option value="active">Ativo (Pago)</option>
                            <option value="blocked">Bloqueado</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono">
                        {profile.expires_at ? (
                          <span className={new Date(profile.expires_at) < new Date() ? 'text-red-500' : 'text-green-500'}>
                            {new Date(profile.expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {/* More actions could go here */}
                      </td>
                    </tr>
                  ))}
                  
                  {profiles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 font-mono">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
