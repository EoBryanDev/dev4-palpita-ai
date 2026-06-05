import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { db } from './connection';
import {
  configuracoes,
  palpites,
  partidas,
  rodadas,
  times,
  usuarios,
} from './schema';

// Carregar variáveis de ambiente
dotenv.config();

async function seed() {
  console.log('Iniciando seed de dados...');

  try {
    const senhaHash = await bcrypt.hash('senha123', 10);

    // 1. Criar usuário Administrador
    const emailAdmin = 'admin@palpita.com.br';
    let adminId = '';
    const adminExistente = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, emailAdmin))
      .limit(1);

    if (adminExistente.length === 0) {
      const result = await db
        .insert(usuarios)
        .values({
          nome: 'Administrador Palpita',
          email: emailAdmin,
          status: 'ATIVO',
          cargo: 'ADMIN',
          senha: senhaHash,
        })
        .returning({ id: usuarios.id });
      adminId = result[0].id;
      console.log(`Usuário ADMIN criado: ${emailAdmin} / senha123`);
    } else {
      adminId = adminExistente[0].id;
      console.log(`Usuário ADMIN já existe: ${emailAdmin}`);
    }

    // 2. Criar competidor (COLABORADOR)
    const emailUser = 'user@palpita.com.br';
    let userId = '';
    const userExistente = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, emailUser))
      .limit(1);

    if (userExistente.length === 0) {
      const result = await db
        .insert(usuarios)
        .values({
          nome: 'Competidor Palpita',
          email: emailUser,
          status: 'LIBERADO', // Definir como LIBERADO para que ele possa palpitar por padrão
          cargo: 'COLABORADOR',
          senha: senhaHash,
        })
        .returning({ id: usuarios.id });
      userId = result[0].id;
      console.log(
        `Usuário COLABORADOR criado: ${emailUser} / senha123 (status: LIBERADO)`,
      );
    } else {
      userId = userExistente[0].id;
      // Garantir que esteja como LIBERADO para os testes
      await db
        .update(usuarios)
        .set({ status: 'LIBERADO' })
        .where(eq(usuarios.id, userId));
      console.log(`Usuário COLABORADOR já existe: ${emailUser}`);
    }

    // 3. Criar Rodada de Teste
    const rodadaNumero = 1;
    let rodadaId = '';
    const rodadaExistente = await db
      .select()
      .from(rodadas)
      .where(eq(rodadas.numero, rodadaNumero))
      .limit(1);

    if (rodadaExistente.length === 0) {
      const result = await db
        .insert(rodadas)
        .values({
          numero: rodadaNumero,
          nome: 'Fase de Grupos - Rodada 1',
          ativa: true,
        })
        .returning({ id: rodadas.id });
      rodadaId = result[0].id;
      console.log('Rodada 1 criada.');
    } else {
      rodadaId = rodadaExistente[0].id;
      console.log('Rodada 1 já existe.');
    }

    // Limpar partidas, palpites e times antigos para rodar o seed de forma limpa
    await db.delete(palpites);
    await db.delete(partidas);
    await db.delete(times);

    // 4. Cadastrar Times Reais
    const timesMock = [
      // Grupo A
      {
        nome: 'México',
        emoji: '🇲🇽',
        confederacao: 'CONCACAF',
        grupo: 'Grupo A',
      },
      {
        nome: 'África do Sul',
        emoji: '🇿🇦',
        confederacao: 'CAF',
        grupo: 'Grupo A',
      },
      {
        nome: 'Coreia do Sul',
        emoji: '🇰🇷',
        confederacao: 'AFC',
        grupo: 'Grupo A',
      },
      {
        nome: 'República Tcheca',
        emoji: '🇨🇿',
        confederacao: 'UEFA',
        grupo: 'Grupo A',
      },

      // Grupo B
      {
        nome: 'Canadá',
        emoji: '🇨🇦',
        confederacao: 'CONCACAF',
        grupo: 'Grupo B',
      },
      { nome: 'Bósnia', emoji: '🇧🇦', confederacao: 'UEFA', grupo: 'Grupo B' },
      { nome: 'Catar', emoji: '🇶🇦', confederacao: 'AFC', grupo: 'Grupo B' },
      { nome: 'Suíça', emoji: '🇨🇭', confederacao: 'UEFA', grupo: 'Grupo B' },

      // Grupo C
      {
        nome: 'Brasil',
        emoji: '🇧🇷',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo C',
      },
      { nome: 'Marrocos', emoji: '🇲🇦', confederacao: 'CAF', grupo: 'Grupo C' },
      {
        nome: 'Haiti',
        emoji: '🇭🇹',
        confederacao: 'CONCACAF',
        grupo: 'Grupo C',
      },
      { nome: 'Escócia', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederacao: 'UEFA', grupo: 'Grupo C' },

      // Grupo D
      {
        nome: 'Estados Unidos',
        emoji: '🇺🇸',
        confederacao: 'CONCACAF',
        grupo: 'Grupo D',
      },
      {
        nome: 'Paraguai',
        emoji: '🇵🇾',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo D',
      },
      { nome: 'Austrália', emoji: '🇦🇺', confederacao: 'AFC', grupo: 'Grupo D' },
      { nome: 'Turquia', emoji: '🇹🇷', confederacao: 'UEFA', grupo: 'Grupo D' },

      // Grupo E
      { nome: 'Alemanha', emoji: '🇩🇪', confederacao: 'UEFA', grupo: 'Grupo E' },
      {
        nome: 'Curaçao',
        emoji: '🇨🇼',
        confederacao: 'CONCACAF',
        grupo: 'Grupo E',
      },
      {
        nome: 'Costa do Marfim',
        emoji: '🇨🇮',
        confederacao: 'CAF',
        grupo: 'Grupo E',
      },
      {
        nome: 'Equador',
        emoji: '🇪🇨',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo E',
      },

      // Grupo F
      { nome: 'Holanda', emoji: '🇳🇱', confederacao: 'UEFA', grupo: 'Grupo F' },
      { nome: 'Japão', emoji: '🇯🇵', confederacao: 'AFC', grupo: 'Grupo F' },
      { nome: 'Suécia', emoji: '🇸🇪', confederacao: 'UEFA', grupo: 'Grupo F' },
      { nome: 'Tunísia', emoji: '🇹🇳', confederacao: 'CAF', grupo: 'Grupo F' },

      // Grupo G
      { nome: 'Bélgica', emoji: '🇧🇪', confederacao: 'UEFA', grupo: 'Grupo G' },
      { nome: 'Egito', emoji: '🇪🇬', confederacao: 'CAF', grupo: 'Grupo G' },
      { nome: 'Irã', emoji: '🇮🇷', confederacao: 'AFC', grupo: 'Grupo G' },
      {
        nome: 'Nova Zelândia',
        emoji: '🇳🇿',
        confederacao: 'OFC',
        grupo: 'Grupo G',
      },

      // Grupo H
      { nome: 'Espanha', emoji: '🇪🇸', confederacao: 'UEFA', grupo: 'Grupo H' },
      {
        nome: 'Cabo Verde',
        emoji: '🇨🇻',
        confederacao: 'CAF',
        grupo: 'Grupo H',
      },
      {
        nome: 'Arábia Saudita',
        emoji: '🇸🇦',
        confederacao: 'AFC',
        grupo: 'Grupo H',
      },
      {
        nome: 'Uruguai',
        emoji: '🇺🇾',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo H',
      },

      // Grupo I
      { nome: 'França', emoji: '🇫🇷', confederacao: 'UEFA', grupo: 'Grupo I' },
      { nome: 'Senegal', emoji: '🇸🇳', confederacao: 'CAF', grupo: 'Grupo I' },
      { nome: 'Iraque', emoji: '🇮🇶', confederacao: 'AFC', grupo: 'Grupo I' },
      { nome: 'Noruega', emoji: '🇳🇴', confederacao: 'UEFA', grupo: 'Grupo I' },

      // Grupo J
      {
        nome: 'Argentina',
        emoji: '🇦🇷',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo J',
      },
      { nome: 'Argélia', emoji: '🇩🇿', confederacao: 'CAF', grupo: 'Grupo J' },
      { nome: 'Áustria', emoji: '🇦🇹', confederacao: 'UEFA', grupo: 'Grupo J' },
      { nome: 'Jordânia', emoji: '🇯🇴', confederacao: 'AFC', grupo: 'Grupo J' },

      // Grupo K
      { nome: 'Portugal', emoji: '🇵🇹', confederacao: 'UEFA', grupo: 'Grupo K' },
      { nome: 'RD Congo', emoji: '🇨🇩', confederacao: 'CAF', grupo: 'Grupo K' },
      {
        nome: 'Uzbequistão',
        emoji: '🇺🇿',
        confederacao: 'AFC',
        grupo: 'Grupo K',
      },
      {
        nome: 'Colômbia',
        emoji: '🇨🇴',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo K',
      },

      // Grupo L
      {
        nome: 'Inglaterra',
        emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        confederacao: 'UEFA',
        grupo: 'Grupo L',
      },
      { nome: 'Croácia', emoji: '🇭🇷', confederacao: 'UEFA', grupo: 'Grupo L' },
      { nome: 'Gana', emoji: '🇬🇭', confederacao: 'CAF', grupo: 'Grupo L' },
      {
        nome: 'Panamá',
        emoji: '🇵🇦',
        confederacao: 'CONCACAF',
        grupo: 'Grupo L',
      },
    ];

    const timesInseridos = await db
      .insert(times)
      .values(timesMock)
      .returning({ id: times.id, nome: times.nome });

    const timesMap = new Map<string, string>();
    for (const t of timesInseridos) {
      timesMap.set(t.nome, t.id);
    }
    console.log('Times da Copa do Mundo criados.');

    // 5. Criar Partidas Reais da Rodada 1
    const partidasValores = [
      // Grupo A
      {
        timeA: 'México',
        timeB: 'África do Sul',
        dataInicio: new Date('2026-06-11T16:00:00-03:00'),
      },
      {
        timeA: 'Coreia do Sul',
        timeB: 'República Tcheca',
        dataInicio: new Date('2026-06-11T23:00:00-03:00'),
      },
      // Grupo B
      {
        timeA: 'Canadá',
        timeB: 'Bósnia',
        dataInicio: new Date('2026-06-12T16:00:00-03:00'),
      },
      {
        timeA: 'Catar',
        timeB: 'Suíça',
        dataInicio: new Date('2026-06-13T16:00:00-03:00'),
      },
      // Grupo C
      {
        timeA: 'Brasil',
        timeB: 'Marrocos',
        dataInicio: new Date('2026-06-13T19:00:00-03:00'),
      },
      {
        timeA: 'Haiti',
        timeB: 'Escócia',
        dataInicio: new Date('2026-06-13T22:00:00-03:00'),
      },
      // Grupo D
      {
        timeA: 'Estados Unidos',
        timeB: 'Paraguai',
        dataInicio: new Date('2026-06-12T22:00:00-03:00'),
      },
      {
        timeA: 'Austrália',
        timeB: 'Turquia',
        dataInicio: new Date('2026-06-14T01:00:00-03:00'),
      },
      // Grupo E
      {
        timeA: 'Alemanha',
        timeB: 'Curaçao',
        dataInicio: new Date('2026-06-14T14:00:00-03:00'),
      },
      {
        timeA: 'Costa do Marfim',
        timeB: 'Equador',
        dataInicio: new Date('2026-06-14T20:00:00-03:00'),
      },
      // Grupo F
      {
        timeA: 'Holanda',
        timeB: 'Japão',
        dataInicio: new Date('2026-06-14T17:00:00-03:00'),
      },
      {
        timeA: 'Suécia',
        timeB: 'Tunísia',
        dataInicio: new Date('2026-06-14T23:00:00-03:00'),
      },
      // Grupo G
      {
        timeA: 'Bélgica',
        timeB: 'Egito',
        dataInicio: new Date('2026-06-15T16:00:00-03:00'),
      },
      {
        timeA: 'Irã',
        timeB: 'Nova Zelândia',
        dataInicio: new Date('2026-06-15T22:00:00-03:00'),
      },
      // Grupo H
      {
        timeA: 'Espanha',
        timeB: 'Cabo Verde',
        dataInicio: new Date('2026-06-15T13:00:00-03:00'),
      },
      {
        timeA: 'Arábia Saudita',
        timeB: 'Uruguai',
        dataInicio: new Date('2026-06-15T19:00:00-03:00'),
      },
      // Grupo I
      {
        timeA: 'França',
        timeB: 'Senegal',
        dataInicio: new Date('2026-06-16T16:00:00-03:00'),
      },
      {
        timeA: 'Iraque',
        timeB: 'Noruega',
        dataInicio: new Date('2026-06-16T19:00:00-03:00'),
      },
      // Grupo J
      {
        timeA: 'Argentina',
        timeB: 'Argélia',
        dataInicio: new Date('2026-06-16T22:00:00-03:00'),
      },
      {
        timeA: 'Áustria',
        timeB: 'Jordânia',
        dataInicio: new Date('2026-06-17T01:00:00-03:00'),
      },
      // Grupo K
      {
        timeA: 'Portugal',
        timeB: 'RD Congo',
        dataInicio: new Date('2026-06-17T14:00:00-03:00'),
      },
      {
        timeA: 'Uzbequistão',
        timeB: 'Colômbia',
        dataInicio: new Date('2026-06-17T21:00:00-03:00'),
      },
      // Grupo L
      {
        timeA: 'Inglaterra',
        timeB: 'Croácia',
        dataInicio: new Date('2026-06-17T17:00:00-03:00'),
      },
      {
        timeA: 'Gana',
        timeB: 'Panamá',
        dataInicio: new Date('2026-06-17T20:00:00-03:00'),
      },
    ];

    const partidasMap = new Map<string, string>();
    for (const match of partidasValores) {
      const timeAId = timesMap.get(match.timeA) ?? '';
      const timeBId = timesMap.get(match.timeB) ?? '';
      const [inserted] = await db
        .insert(partidas)
        .values({
          rodadaId,
          timeAId,
          timeBId,
          dataInicio: match.dataInicio,
          status: 'AGENDADO',
        })
        .returning({ id: partidas.id });

      partidasMap.set(`${match.timeA} vs ${match.timeB}`, inserted.id);
    }

    console.log('Todas as partidas da Rodada 1 criadas.');

    // 6. Criar Palpites de Teste
    // Competidor e Admin palpitaram no jogo de abertura "México vs África do Sul" (futuro)
    const idMexicoSulAfrica = partidasMap.get('México vs África do Sul');
    if (idMexicoSulAfrica) {
      await db.insert(palpites).values({
        usuarioId: userId,
        partidaId: idMexicoSulAfrica,
        golsTimeA: 2,
        golsTimeB: 1,
      });

      await db.insert(palpites).values({
        usuarioId: adminId,
        partidaId: idMexicoSulAfrica,
        golsTimeA: 1,
        golsTimeB: 0,
      });
    }

    // Competidor palpitou 2 x 2 no Alemanha vs Curaçao (futuro)
    const idAlemanhaCuracao = partidasMap.get('Alemanha vs Curaçao');
    if (idAlemanhaCuracao) {
      await db.insert(palpites).values({
        usuarioId: userId,
        partidaId: idAlemanhaCuracao,
        golsTimeA: 2,
        golsTimeB: 2,
      });
    }

    console.log('Palpites de teste criados.');

    // 7. Criar configurações iniciais
    const configChave = 'valor_palpite';
    const configExistente = await db
      .select()
      .from(configuracoes)
      .where(eq(configuracoes.chave, configChave))
      .limit(1);

    if (configExistente.length === 0) {
      await db.insert(configuracoes).values({
        chave: configChave,
        valor: '50.00',
      });
      console.log('Configuração "valor_palpite" inicial criada: R$ 50,00.');
    } else {
      console.log('Configuração "valor_palpite" já existe.');
    }

    console.log('Seed finalizado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();
