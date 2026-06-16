'use client';

import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { useToast } from '@/components/ui/use-toast';
import {
  useMutationAlterarStatusUsuario,
  useMutationAprovarSolicitacao,
  useMutationLiberarUsuarioAtrasado,
  useMutationRejeitarSolicitacao,
} from '@/hooks/mutations/useMutationUsuarios';
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
import { useState } from 'react';

import type {
  IAdminUsuariosClientProps,
  IUsuarioAdmin,
} from '@/interface/IAdmin';

export function AdminUsuariosClient({
  usuarios,
  adminEmail,
}: IAdminUsuariosClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const mutationAprovar = useMutationAprovarSolicitacao();
  const mutationRejeitar = useMutationRejeitarSolicitacao();
  const mutationAlterarStatus = useMutationAlterarStatusUsuario();
  const mutationLiberarAtrasado = useMutationLiberarUsuarioAtrasado();

  const isPending =
    mutationAprovar.isPending ||
    mutationRejeitar.isPending ||
    mutationAlterarStatus.isPending ||
    mutationLiberarAtrasado.isPending;

  // Armazena links recém-gerados na sessão local para cópia rápida
  const [linksGerados, setLinksGerados] = useState<Record<string, string>>({});

  const handleAprovar = async (usuarioId: string) => {
    try {
      const res = await mutationAprovar.mutateAsync(usuarioId);
      if (res.link) {
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
      }
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Erro ao aprovar',
        description: err.message || 'Erro ao processar aprovação.',
        variant: 'destructive',
      });
    }
  };

  const handleRejeitar = async (usuarioId: string) => {
    try {
      const res = await mutationRejeitar.mutateAsync(usuarioId);
      toast({
        title: 'Solicitação Rejeitada',
        description: res.message,
      });
      router.refresh();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Erro ao rejeitar',
        description: err.message || 'Erro ao processar rejeição.',
        variant: 'destructive',
      });
    }
  };

  const handleAlterarStatus = async (
    usuarioId: string,
    novoStatus: 'ATIVO' | 'LIBERADO' | 'DESATIVADO',
  ) => {
    try {
      const res = await mutationAlterarStatus.mutateAsync({
        usuarioId,
        novoStatus,
      });
      toast({
        title: 'Status Atualizado',
        description: res.message,
      });
      router.refresh();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Erro ao atualizar status',
        description: err.message || 'Erro ao atualizar status.',
        variant: 'destructive',
      });
    }
  };

  const handleLiberarAtrasado = async (usuarioId: string) => {
    try {
      const res = await mutationLiberarAtrasado.mutateAsync(usuarioId);
      toast({
        title: 'Acesso Tardio Liberado!',
        description: res.message,
      });
      router.refresh();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Erro ao liberar',
        description: err.message || 'Erro ao liberar acesso tardio.',
        variant: 'destructive',
      });
    }
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
        <StatCard
          title="Total de Usuários"
          value={totalUsuarios}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Solicitações Pendentes"
          value={pendentesAprovacao}
          icon={ShieldAlert}
          color="amber"
        />
        <StatCard
          title="Apostas Liberadas"
          value={totalLiberados}
          icon={UserCheck}
          color="teal"
        />
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
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleAprovar(solicitacao.id)}
                      className={`font-semibold text-xs px-4 h-9 rounded-xl flex items-center gap-1 transition-all ${
                        linkAprovado
                          ? 'border-amber-600/20 text-amber-600 hover:bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-950/20'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'
                      }`}
                      variant={linkAprovado ? 'outline' : undefined}
                    >
                      {linkAprovado ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {linkAprovado ? 'Reenviar Link' : 'Aprovar'}
                    </Button>

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
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Nome</th>
                    <th className="py-4 px-6">Cargo</th>
                    <th className="py-4 px-6">Status (Apostas)</th>
                    <th className="py-4 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
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
                              <>
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isPending}
                                  onClick={() =>
                                    handleLiberarAtrasado(usuario.id)
                                  }
                                  className="h-8 rounded-lg text-xs font-bold border-blue-600/20 text-blue-600 hover:bg-blue-50 dark:border-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-950/20"
                                >
                                  <Shield className="h-3.5 w-3.5 mr-1" />
                                  Liberar Acesso Tardio
                                </Button>
                              </>
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
                                className="h-8 rounded-lg text-xs font-bold border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
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
