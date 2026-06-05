'use client';

import {
  alterarStatusUsuario,
  aprovarSolicitacao,
  rejeitarSolicitacao,
} from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Check,
  CheckCircle,
  Copy,
  ExternalLink,
  Shield,
  ShieldAlert,
  UserCheck,
  UserMinus,
  UserX,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export interface IUsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  status: 'PENDENTE' | 'ATIVO' | 'DESATIVADO' | 'LIBERADO';
  cargo: 'ADMIN' | 'COLABORADOR';
  dataCriacao: string;
  tokenId?: string | null;
}

interface IAdminUsuariosClientProps {
  usuarios: IUsuarioAdmin[];
  adminEmail: string;
}

export function AdminUsuariosClient({
  usuarios,
  adminEmail,
}: IAdminUsuariosClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Armazena links recém-gerados na sessão local para cópia rápida
  const [linksGerados, setLinksGerados] = useState<Record<string, string>>({});

  const handleAprovar = (usuarioId: string) => {
    startTransition(async () => {
      const res = await aprovarSolicitacao(usuarioId);
      if (res.success && res.link) {
        // Obter a URL base atual do navegador
        const urlBase = window.location.origin;
        const linkCompleto = `${urlBase}${res.link}`;

        setLinksGerados((prev) => ({
          ...prev,
          [usuarioId]: linkCompleto,
        }));

        toast({
          title: 'Solicitação Aprovada!',
          description: 'O link de ativação foi gerado com sucesso.',
        });
        router.refresh();
      } else {
        toast({
          title: 'Erro ao aprovar',
          description: res.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleRejeitar = (usuarioId: string) => {
    startTransition(async () => {
      const res = await rejeitarSolicitacao(usuarioId);
      if (res.success) {
        toast({
          title: 'Solicitação Rejeitada',
          description: res.message,
        });
        router.refresh();
      } else {
        toast({
          title: 'Erro ao rejeitar',
          description: res.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleAlterarStatus = (
    usuarioId: string,
    novoStatus: 'ATIVO' | 'LIBERADO' | 'DESATIVADO',
  ) => {
    startTransition(async () => {
      const res = await alterarStatusUsuario(usuarioId, novoStatus);
      if (res.success) {
        toast({
          title: 'Status Atualizado',
          description: res.message,
        });
        router.refresh();
      } else {
        toast({
          title: 'Erro ao atualizar status',
          description: res.message,
          variant: 'destructive',
        });
      }
    });
  };

  const copiarParaTransferencia = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast({
      title: 'Link Copiado!',
      description:
        'O link de ativação foi copiado para a área de transferência.',
    });
  };

  // Separação de usuários
  const solicitacoesPendentes = usuarios.filter((u) => u.status === 'PENDENTE');
  const usuariosCadastrados = usuarios.filter((u) => u.status !== 'PENDENTE');

  // Métricas rápidas
  const totalUsuarios = usuarios.length;
  const pendentesAprovacao = solicitacoesPendentes.length;
  const totalLiberados = usuarios.filter((u) => u.status === 'LIBERADO').length;

  return (
    <div className="space-y-10">
      {/* Cards de Métricas - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Total de Usuários
              </span>
              <span className="text-3xl font-black">{totalUsuarios}</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Solicitações Pendentes
              </span>
              <span className="text-3xl font-black">{pendentesAprovacao}</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Apostas Liberadas
              </span>
              <span className="text-3xl font-black">{totalLiberados}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 1: Solicitações de Convites */}
      <div className="space-y-4">
        <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
          Solicitações de Convites ({solicitacoesPendentes.length})
        </h3>

        {solicitacoesPendentes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center bg-white/40 dark:bg-zinc-900/10">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">Tudo sob controle!</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Nenhuma solicitação de convite pendente de aprovação.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {solicitacoesPendentes.map((solicitacao) => {
              const urlBase =
                typeof window !== 'undefined' ? window.location.origin : '';
              const linkPreExistente = solicitacao.tokenId
                ? `${urlBase}/validation-user/${solicitacao.tokenId}`
                : null;
              const linkAprovado =
                linksGerados[solicitacao.id] || linkPreExistente;

              return (
                <div
                  key={solicitacao.id}
                  className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-zinc-350 dark:hover:border-zinc-700"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                      {solicitacao.nome}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {solicitacao.email}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Solicitado em:{' '}
                      {new Date(solicitacao.dataCriacao).toLocaleDateString(
                        'pt-BR',
                        { timeZone: 'America/Sao_Paulo' },
                      )}
                    </p>
                  </div>

                  {linkAprovado ? (
                    <div className="flex-1 max-w-md mx-0 md:mx-6 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate select-all">
                        {linkAprovado}
                      </span>
                      <div className="flex gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
                          onClick={() => copiarParaTransferencia(linkAprovado)}
                          title="Copiar Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <a
                          href={linkAprovado}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
                            title="Abrir Link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 shrink-0">
                    {!linkAprovado ? (
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleAprovar(solicitacao.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 h-9 rounded-xl flex items-center gap-1 transition-all dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                      >
                        <Check className="h-4 w-4" />
                        Aprovar
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        Aprovado
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleRejeitar(solicitacao.id)}
                      className="border-red-500/20 text-red-500 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-950/20 font-semibold text-xs px-4 h-9 rounded-xl flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seção 2: Usuários Cadastrados */}
      <div className="space-y-4">
        <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Usuários Cadastrados ({usuariosCadastrados.length})
        </h3>

        {usuariosCadastrados.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center bg-white/40 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-500">
            Nenhum usuário cadastrado além do administrador.
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[11px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Nome</th>
                    <th className="py-4 px-6">Cargo</th>
                    <th className="py-4 px-6">Status (Apostas)</th>
                    <th className="py-4 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                  {usuariosCadastrados.map((usuario) => {
                    const statusConfig = {
                      ATIVO: {
                        label: 'Pendente de Liberação',
                        class:
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
                      },
                      LIBERADO: {
                        label: 'Liberado',
                        class:
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
                      },
                      DESATIVADO: {
                        label: 'Inativo',
                        class:
                          'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-400',
                      },
                      PENDENTE: {
                        label: 'Pendente de Ativação',
                        class:
                          'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
                      },
                    };

                    const cfg =
                      statusConfig[usuario.status] || statusConfig.ATIVO;
                    const isSelf = usuario.email === adminEmail;

                    return (
                      <tr
                        key={usuario.id}
                        className="text-sm transition-colors hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10"
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-zinc-900 dark:text-zinc-50">
                            {usuario.nome} {isSelf && '(Você)'}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {usuario.email}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50">
                            {usuario.cargo}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cfg.class}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Lógica de controle de liberação */}
                            {usuario.status === 'ATIVO' && !isSelf && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isPending}
                                onClick={() =>
                                  handleAlterarStatus(usuario.id, 'LIBERADO')
                                }
                                className="h-8 rounded-lg text-xs font-bold border-emerald-600/20 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                              >
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                                Liberar Apostas
                              </Button>
                            )}

                            {usuario.status === 'LIBERADO' && !isSelf && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isPending}
                                onClick={() =>
                                  handleAlterarStatus(usuario.id, 'ATIVO')
                                }
                                className="h-8 rounded-lg text-xs font-bold border-amber-600/20 text-amber-600 hover:bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-950/20"
                              >
                                <UserMinus className="h-3.5 w-3.5 mr-1" />
                                Bloquear Apostas
                              </Button>
                            )}

                            {usuario.status !== 'DESATIVADO' && !isSelf && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isPending}
                                onClick={() =>
                                  handleAlterarStatus(usuario.id, 'DESATIVADO')
                                }
                                className="h-8 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25"
                                title="Desativar Conta"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}

                            {usuario.status === 'DESATIVADO' && !isSelf && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isPending}
                                onClick={() =>
                                  handleAlterarStatus(usuario.id, 'ATIVO')
                                }
                                className="h-8 rounded-lg text-xs font-bold border-zinc-350 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                              >
                                Reativar
                              </Button>
                            )}

                            {isSelf && (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mr-2">
                                Ações protegidas
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
