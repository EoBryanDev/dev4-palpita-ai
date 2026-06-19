import { obterSessao } from '@/app/actions/auth';
import {
  atualizarStatusFeedback,
  criarFeedback,
  votarFeedback,
} from '@/app/actions/feedback';
import { db } from '@palpita/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@/app/actions/auth', () => ({
  obterSessao: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/services/feedbacks.service', () => ({
  contarFeedbacksHoje: vi.fn(),
  jaVotou: vi.fn(),
  totalVotos: vi.fn(),
}));

vi.mock('@palpita/db', () => ({
  db: {
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
  },
  feedbacks: {
    id: 'feedbacks.id',
    usuarioId: 'feedbacks.usuarioId',
    titulo: 'feedbacks.titulo',
    descricao: 'feedbacks.descricao',
    tipo: 'feedbacks.tipo',
    status: 'feedbacks.status',
  },
  feedbacksVotos: {
    feedbackId: 'feedbacksVotos.feedbackId',
    usuarioId: 'feedbacksVotos.usuarioId',
  },
}));

describe('Ações de Feedback (feedback.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('criarFeedback', () => {
    it('deve retornar erro se o usuário não estiver logado', async () => {
      (obterSessao as Mock).mockResolvedValueOnce(null);

      const res = await criarFeedback({
        titulo: 'Minha ideia',
        descricao: 'Descrição da minha ideia',
        tipo: 'sugestao',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Faça login');
    });

    it('deve retornar erro se o título for muito curto', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({
        id: 'user-id',
        cargo: 'COLABORADOR',
      });

      const res = await criarFeedback({
        titulo: 'ab',
        descricao: 'Descrição válida com mais de 10 caracteres',
        tipo: 'sugestao',
      });

      expect(res.success).toBe(false);
    });

    it('deve retornar erro se a descrição for muito curta', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({
        id: 'user-id',
        cargo: 'COLABORADOR',
      });

      const res = await criarFeedback({
        titulo: 'Título válido',
        descricao: 'curta',
        tipo: 'sugestao',
      });

      expect(res.success).toBe(false);
    });

    it('deve retornar erro se exceder o limite de 3 feedbacks por dia', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({
        id: 'user-id',
        cargo: 'COLABORADOR',
      });
      const { contarFeedbacksHoje } = await import(
        '@/services/feedbacks.service'
      );
      (contarFeedbacksHoje as Mock).mockResolvedValueOnce(3);

      const res = await criarFeedback({
        titulo: 'Minha ideia',
        descricao: 'Descrição da minha ideia com mais de 10 caracteres',
        tipo: 'sugestao',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('3 feedbacks hoje');
    });

    it('deve criar feedback com sucesso', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({
        id: 'user-id',
        cargo: 'COLABORADOR',
      });
      const { contarFeedbacksHoje } = await import(
        '@/services/feedbacks.service'
      );
      (contarFeedbacksHoje as Mock).mockResolvedValueOnce(0);

      const mockInsert = db.insert as Mock;
      mockInsert.mockImplementationOnce(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() =>
            Promise.resolve([
              {
                id: 'feedback-id',
                titulo: 'Minha ideia',
                tipo: 'sugestao',
                status: 'pendente',
                dataCriacao: new Date(),
              },
            ]),
          ),
        })),
      }));

      const res = await criarFeedback({
        titulo: 'Minha ideia',
        descricao: 'Descrição da minha ideia com mais de 10 caracteres',
        tipo: 'sugestao',
      });

      expect(res.success).toBe(true);
      expect(res.feedback?.titulo).toBe('Minha ideia');
    });
  });

  describe('votarFeedback', () => {
    it('deve retornar erro se o usuário não estiver logado', async () => {
      (obterSessao as Mock).mockResolvedValueOnce(null);

      const res = await votarFeedback('feedback-id');

      expect(res.success).toBe(false);
      expect(res.error).toContain('Faça login');
    });

    it('deve adicionar voto se o usuário ainda não votou', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({
        id: 'user-id',
        cargo: 'COLABORADOR',
      });
      const { jaVotou, totalVotos } = await import(
        '@/services/feedbacks.service'
      );
      (jaVotou as Mock).mockResolvedValueOnce(false);
      (totalVotos as Mock).mockResolvedValueOnce(1);

      const mockInsert = db.insert as Mock;
      mockInsert.mockImplementationOnce(() => ({
        values: vi.fn(() => Promise.resolve()),
      }));

      const res = await votarFeedback('feedback-id');

      expect(res.success).toBe(true);
      expect(res.votou).toBe(true);
      expect(res.totalVotos).toBe(1);
    });

    it('deve remover voto se o usuário já votou', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({
        id: 'user-id',
        cargo: 'COLABORADOR',
      });
      const { jaVotou, totalVotos } = await import(
        '@/services/feedbacks.service'
      );
      (jaVotou as Mock).mockResolvedValueOnce(true);
      (totalVotos as Mock).mockResolvedValueOnce(0);

      const mockDelete = db.delete as Mock;
      mockDelete.mockImplementationOnce(() => ({
        where: vi.fn(() => Promise.resolve()),
      }));

      const res = await votarFeedback('feedback-id');

      expect(res.success).toBe(true);
      expect(res.votou).toBe(false);
      expect(res.totalVotos).toBe(0);
    });
  });

  describe('atualizarStatusFeedback', () => {
    it('deve retornar erro se o usuário não for administrador', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({
        id: 'user-id',
        cargo: 'COLABORADOR',
      });

      const res = await atualizarStatusFeedback('feedback-id', 'concluido');

      expect(res.success).toBe(false);
      expect(res.error).toContain('Apenas administradores');
    });

    it('deve retornar erro se o status for inválido', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({
        id: 'user-id',
        cargo: 'ADMIN',
      });

      const res = await atualizarStatusFeedback(
        'feedback-id',
        'status-invalido',
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Status inválido');
    });

    it('deve atualizar status com sucesso', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({
        id: 'user-id',
        cargo: 'ADMIN',
      });

      const mockUpdate = db.update as Mock;
      mockUpdate.mockImplementationOnce(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const res = await atualizarStatusFeedback('feedback-id', 'concluido');

      expect(res.success).toBe(true);
    });
  });
});
