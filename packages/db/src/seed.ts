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

    // Rodada 2
    const rodada2Existente = await db
      .select()
      .from(rodadas)
      .where(eq(rodadas.numero, 2))
      .limit(1);

    let rodada2Id = '';
    if (rodada2Existente.length === 0) {
      const result = await db
        .insert(rodadas)
        .values({
          numero: 2,
          nome: 'Fase de Grupos - Rodada 2',
          ativa: true,
        })
        .returning({ id: rodadas.id });
      rodada2Id = result[0].id;
      console.log('Rodada 2 criada.');
    } else {
      rodada2Id = rodada2Existente[0].id;
      console.log('Rodada 2 já existe.');
    }

    // Rodada 3
    const rodada3Existente = await db
      .select()
      .from(rodadas)
      .where(eq(rodadas.numero, 3))
      .limit(1);

    let rodada3Id = '';
    if (rodada3Existente.length === 0) {
      const result = await db
        .insert(rodadas)
        .values({
          numero: 3,
          nome: 'Fase de Grupos - Rodada 3',
          ativa: true,
        })
        .returning({ id: rodadas.id });
      rodada3Id = result[0].id;
      console.log('Rodada 3 criada.');
    } else {
      rodada3Id = rodada3Existente[0].id;
      console.log('Rodada 3 já existe.');
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
        idioma: 'Espanhol',
      },
      {
        nome: 'África do Sul',
        emoji: '🇿🇦',
        confederacao: 'CAF',
        grupo: 'Grupo A',
        idioma: 'Zulu, Xhosa, Inglês',
      },
      {
        nome: 'Coreia do Sul',
        emoji: '🇰🇷',
        confederacao: 'AFC',
        grupo: 'Grupo A',
        idioma: 'Coreano',
      },
      {
        nome: 'República Tcheca',
        emoji: '🇨🇿',
        confederacao: 'UEFA',
        grupo: 'Grupo A',
        idioma: 'Tcheco',
      },

      // Grupo B
      {
        nome: 'Canadá',
        emoji: '🇨🇦',
        confederacao: 'CONCACAF',
        grupo: 'Grupo B',
        idioma: 'Inglês, Francês',
      },
      {
        nome: 'Bósnia',
        emoji: '🇧🇦',
        confederacao: 'UEFA',
        grupo: 'Grupo B',
        idioma: 'Bósnio',
      },
      {
        nome: 'Catar',
        emoji: '🇶🇦',
        confederacao: 'AFC',
        grupo: 'Grupo B',
        idioma: 'Árabe',
      },
      {
        nome: 'Suíça',
        emoji: '🇨🇭',
        confederacao: 'UEFA',
        grupo: 'Grupo B',
        idioma: 'Alemão, Francês, Italiano',
      },

      // Grupo C
      {
        nome: 'Brasil',
        emoji: '🇧🇷',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo C',
        idioma: 'Português',
      },
      {
        nome: 'Marrocos',
        emoji: '🇲🇦',
        confederacao: 'CAF',
        grupo: 'Grupo C',
        idioma: 'Árabe, Berbere',
      },
      {
        nome: 'Haiti',
        emoji: '🇭🇹',
        confederacao: 'CONCACAF',
        grupo: 'Grupo C',
        idioma: 'Francês, Haitiano',
      },
      {
        nome: 'Escócia',
        emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        confederacao: 'UEFA',
        grupo: 'Grupo C',
        idioma: 'Inglês, Gaélico',
      },

      // Grupo D
      {
        nome: 'Estados Unidos',
        emoji: '🇺🇸',
        confederacao: 'CONCACAF',
        grupo: 'Grupo D',
        idioma: 'Inglês',
      },
      {
        nome: 'Paraguai',
        emoji: '🇵🇾',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo D',
        idioma: 'Espanhol, Guarani',
      },
      {
        nome: 'Austrália',
        emoji: '🇦🇺',
        confederacao: 'AFC',
        grupo: 'Grupo D',
        idioma: 'Inglês',
      },
      {
        nome: 'Turquia',
        emoji: '🇹🇷',
        confederacao: 'UEFA',
        grupo: 'Grupo D',
        idioma: 'Turco',
      },

      // Grupo E
      {
        nome: 'Alemanha',
        emoji: '🇩🇪',
        confederacao: 'UEFA',
        grupo: 'Grupo E',
        idioma: 'Alemão',
      },
      {
        nome: 'Curaçao',
        emoji: '🇨🇼',
        confederacao: 'CONCACAF',
        grupo: 'Grupo E',
        idioma: 'Papiamento, Holandês',
      },
      {
        nome: 'Costa do Marfim',
        emoji: '🇨🇮',
        confederacao: 'CAF',
        grupo: 'Grupo E',
        idioma: 'Francês',
      },
      {
        nome: 'Equador',
        emoji: '🇪🇨',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo E',
        idioma: 'Espanhol',
      },

      // Grupo F
      {
        nome: 'Holanda',
        emoji: '🇳🇱',
        confederacao: 'UEFA',
        grupo: 'Grupo F',
        idioma: 'Holandês',
      },
      {
        nome: 'Japão',
        emoji: '🇯🇵',
        confederacao: 'AFC',
        grupo: 'Grupo F',
        idioma: 'Japonês',
      },
      {
        nome: 'Suécia',
        emoji: '🇸🇪',
        confederacao: 'UEFA',
        grupo: 'Grupo F',
        idioma: 'Sueco',
      },
      {
        nome: 'Tunísia',
        emoji: '🇹🇳',
        confederacao: 'CAF',
        grupo: 'Grupo F',
        idioma: 'Árabe',
      },

      // Grupo G
      {
        nome: 'Bélgica',
        emoji: '🇧🇪',
        confederacao: 'UEFA',
        grupo: 'Grupo G',
        idioma: 'Holandês, Francês, Alemão',
      },
      {
        nome: 'Egito',
        emoji: '🇪🇬',
        confederacao: 'CAF',
        grupo: 'Grupo G',
        idioma: 'Árabe',
      },
      {
        nome: 'Irã',
        emoji: '🇮🇷',
        confederacao: 'AFC',
        grupo: 'Grupo G',
        idioma: 'Persa',
      },
      {
        nome: 'Nova Zelândia',
        emoji: '🇳🇿',
        confederacao: 'OFC',
        grupo: 'Grupo G',
        idioma: 'Inglês, Maori',
      },

      // Grupo H
      {
        nome: 'Espanha',
        emoji: '🇪🇸',
        confederacao: 'UEFA',
        grupo: 'Grupo H',
        idioma: 'Espanhol',
      },
      {
        nome: 'Cabo Verde',
        emoji: '🇨🇻',
        confederacao: 'CAF',
        grupo: 'Grupo H',
        idioma: 'Português',
      },
      {
        nome: 'Arábia Saudita',
        emoji: '🇸🇦',
        confederacao: 'AFC',
        grupo: 'Grupo H',
        idioma: 'Árabe',
      },
      {
        nome: 'Uruguai',
        emoji: '🇺🇾',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo H',
        idioma: 'Espanhol',
      },

      // Grupo I
      {
        nome: 'França',
        emoji: '🇫🇷',
        confederacao: 'UEFA',
        grupo: 'Grupo I',
        idioma: 'Francês',
      },
      {
        nome: 'Senegal',
        emoji: '🇸🇳',
        confederacao: 'CAF',
        grupo: 'Grupo I',
        idioma: 'Francês',
      },
      {
        nome: 'Iraque',
        emoji: '🇮🇶',
        confederacao: 'AFC',
        grupo: 'Grupo I',
        idioma: 'Árabe, Curdo',
      },
      {
        nome: 'Noruega',
        emoji: '🇳🇴',
        confederacao: 'UEFA',
        grupo: 'Grupo I',
        idioma: 'Norueguês',
      },

      // Grupo J
      {
        nome: 'Argentina',
        emoji: '🇦🇷',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo J',
        idioma: 'Espanhol',
      },
      {
        nome: 'Argélia',
        emoji: '🇩🇿',
        confederacao: 'CAF',
        grupo: 'Grupo J',
        idioma: 'Árabe, Berbere',
      },
      {
        nome: 'Áustria',
        emoji: '🇦🇹',
        confederacao: 'UEFA',
        grupo: 'Grupo J',
        idioma: 'Alemão',
      },
      {
        nome: 'Jordânia',
        emoji: '🇯🇴',
        confederacao: 'AFC',
        grupo: 'Grupo J',
        idioma: 'Árabe',
      },

      // Grupo K
      {
        nome: 'Portugal',
        emoji: '🇵🇹',
        confederacao: 'UEFA',
        grupo: 'Grupo K',
        idioma: 'Português',
      },
      {
        nome: 'RD Congo',
        emoji: '🇨🇩',
        confederacao: 'CAF',
        grupo: 'Grupo K',
        idioma: 'Francês',
      },
      {
        nome: 'Uzbequistão',
        emoji: '🇺🇿',
        confederacao: 'AFC',
        grupo: 'Grupo K',
        idioma: 'Uzbeque',
      },
      {
        nome: 'Colômbia',
        emoji: '🇨🇴',
        confederacao: 'CONMEBOL',
        grupo: 'Grupo K',
        idioma: 'Espanhol',
      },

      // Grupo L
      {
        nome: 'Inglaterra',
        emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        confederacao: 'UEFA',
        grupo: 'Grupo L',
        idioma: 'Inglês',
      },
      {
        nome: 'Croácia',
        emoji: '🇭🇷',
        confederacao: 'UEFA',
        grupo: 'Grupo L',
        idioma: 'Croata',
      },
      {
        nome: 'Gana',
        emoji: '🇬🇭',
        confederacao: 'CAF',
        grupo: 'Grupo L',
        idioma: 'Inglês',
      },
      {
        nome: 'Panamá',
        emoji: '🇵🇦',
        confederacao: 'CONCACAF',
        grupo: 'Grupo L',
        idioma: 'Espanhol',
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

    // 5b. Criar Partidas da Rodada 2
    const rodada2Partidas = [
      {
        timeA: 'República Tcheca',
        timeB: 'África do Sul',
        dataInicio: new Date('2026-06-18T13:00:00-03:00'),
      },
      {
        timeA: 'Suíça',
        timeB: 'Bósnia',
        dataInicio: new Date('2026-06-18T16:00:00-03:00'),
      },
      {
        timeA: 'Canadá',
        timeB: 'Catar',
        dataInicio: new Date('2026-06-18T19:00:00-03:00'),
      },
      {
        timeA: 'México',
        timeB: 'Coreia do Sul',
        dataInicio: new Date('2026-06-18T22:00:00-03:00'),
      },
      {
        timeA: 'Turquia',
        timeB: 'Paraguai',
        dataInicio: new Date('2026-06-19T00:00:00-03:00'),
      },
      {
        timeA: 'Estados Unidos',
        timeB: 'Austrália',
        dataInicio: new Date('2026-06-19T16:00:00-03:00'),
      },
      {
        timeA: 'Escócia',
        timeB: 'Marrocos',
        dataInicio: new Date('2026-06-19T19:00:00-03:00'),
      },
      {
        timeA: 'Brasil',
        timeB: 'Haiti',
        dataInicio: new Date('2026-06-19T21:30:00-03:00'),
      },
      {
        timeA: 'Holanda',
        timeB: 'Suécia',
        dataInicio: new Date('2026-06-20T14:00:00-03:00'),
      },
      {
        timeA: 'Alemanha',
        timeB: 'Costa do Marfim',
        dataInicio: new Date('2026-06-20T17:00:00-03:00'),
      },
      {
        timeA: 'Equador',
        timeB: 'Curaçao',
        dataInicio: new Date('2026-06-20T21:00:00-03:00'),
      },
      {
        timeA: 'Tunísia',
        timeB: 'Japão',
        dataInicio: new Date('2026-06-20T23:00:00-03:00'),
      },
      {
        timeA: 'Espanha',
        timeB: 'Arábia Saudita',
        dataInicio: new Date('2026-06-21T13:00:00-03:00'),
      },
      {
        timeA: 'Bélgica',
        timeB: 'Irã',
        dataInicio: new Date('2026-06-21T16:00:00-03:00'),
      },
      {
        timeA: 'Uruguai',
        timeB: 'Cabo Verde',
        dataInicio: new Date('2026-06-21T19:00:00-03:00'),
      },
      {
        timeA: 'Nova Zelândia',
        timeB: 'Egito',
        dataInicio: new Date('2026-06-21T22:00:00-03:00'),
      },
      {
        timeA: 'Argentina',
        timeB: 'Áustria',
        dataInicio: new Date('2026-06-22T14:00:00-03:00'),
      },
      {
        timeA: 'França',
        timeB: 'Iraque',
        dataInicio: new Date('2026-06-22T18:00:00-03:00'),
      },
      {
        timeA: 'Noruega',
        timeB: 'Senegal',
        dataInicio: new Date('2026-06-22T21:00:00-03:00'),
      },
      {
        timeA: 'Jordânia',
        timeB: 'Argélia',
        dataInicio: new Date('2026-06-23T00:00:00-03:00'),
      },
      {
        timeA: 'Portugal',
        timeB: 'Uzbequistão',
        dataInicio: new Date('2026-06-23T14:00:00-03:00'),
      },
      {
        timeA: 'Inglaterra',
        timeB: 'Gana',
        dataInicio: new Date('2026-06-23T17:00:00-03:00'),
      },
      {
        timeA: 'Panamá',
        timeB: 'Croácia',
        dataInicio: new Date('2026-06-23T20:00:00-03:00'),
      },
      {
        timeA: 'Colômbia',
        timeB: 'RD Congo',
        dataInicio: new Date('2026-06-23T23:00:00-03:00'),
      },
    ];

    for (const match of rodada2Partidas) {
      const timeAId = timesMap.get(match.timeA) ?? '';
      const timeBId = timesMap.get(match.timeB) ?? '';
      await db.insert(partidas).values({
        rodadaId: rodada2Id,
        timeAId,
        timeBId,
        dataInicio: match.dataInicio,
        status: 'AGENDADO',
      });
    }
    console.log('Todas as partidas da Rodada 2 criadas.');

    // 5c. Criar Partidas da Rodada 3
    const rodada3Partidas = [
      {
        timeA: 'Suíça',
        timeB: 'Canadá',
        dataInicio: new Date('2026-06-24T16:00:00-03:00'),
      },
      {
        timeA: 'Bósnia',
        timeB: 'Catar',
        dataInicio: new Date('2026-06-24T16:00:00-03:00'),
      },
      {
        timeA: 'Escócia',
        timeB: 'Brasil',
        dataInicio: new Date('2026-06-24T19:00:00-03:00'),
      },
      {
        timeA: 'Marrocos',
        timeB: 'Haiti',
        dataInicio: new Date('2026-06-24T19:00:00-03:00'),
      },
      {
        timeA: 'República Tcheca',
        timeB: 'México',
        dataInicio: new Date('2026-06-24T22:00:00-03:00'),
      },
      {
        timeA: 'África do Sul',
        timeB: 'Coreia do Sul',
        dataInicio: new Date('2026-06-24T22:00:00-03:00'),
      },
      {
        timeA: 'Equador',
        timeB: 'Alemanha',
        dataInicio: new Date('2026-06-25T17:00:00-03:00'),
      },
      {
        timeA: 'Curaçao',
        timeB: 'Costa do Marfim',
        dataInicio: new Date('2026-06-25T17:00:00-03:00'),
      },
      {
        timeA: 'Japão',
        timeB: 'Suécia',
        dataInicio: new Date('2026-06-25T20:00:00-03:00'),
      },
      {
        timeA: 'Tunísia',
        timeB: 'Holanda',
        dataInicio: new Date('2026-06-25T20:00:00-03:00'),
      },
      {
        timeA: 'Turquia',
        timeB: 'Estados Unidos',
        dataInicio: new Date('2026-06-25T23:00:00-03:00'),
      },
      {
        timeA: 'Paraguai',
        timeB: 'Austrália',
        dataInicio: new Date('2026-06-25T23:00:00-03:00'),
      },
      {
        timeA: 'Noruega',
        timeB: 'França',
        dataInicio: new Date('2026-06-26T16:00:00-03:00'),
      },
      {
        timeA: 'Senegal',
        timeB: 'Iraque',
        dataInicio: new Date('2026-06-26T16:00:00-03:00'),
      },
      {
        timeA: 'Cabo Verde',
        timeB: 'Arábia Saudita',
        dataInicio: new Date('2026-06-26T21:00:00-03:00'),
      },
      {
        timeA: 'Uruguai',
        timeB: 'Espanha',
        dataInicio: new Date('2026-06-26T21:00:00-03:00'),
      },
      {
        timeA: 'Egito',
        timeB: 'Irã',
        dataInicio: new Date('2026-06-27T00:00:00-03:00'),
      },
      {
        timeA: 'Nova Zelândia',
        timeB: 'Bélgica',
        dataInicio: new Date('2026-06-27T00:00:00-03:00'),
      },
      {
        timeA: 'Panamá',
        timeB: 'Inglaterra',
        dataInicio: new Date('2026-06-27T18:00:00-03:00'),
      },
      {
        timeA: 'Croácia',
        timeB: 'Gana',
        dataInicio: new Date('2026-06-27T18:00:00-03:00'),
      },
      {
        timeA: 'Colômbia',
        timeB: 'Portugal',
        dataInicio: new Date('2026-06-27T20:30:00-03:00'),
      },
      {
        timeA: 'RD Congo',
        timeB: 'Uzbequistão',
        dataInicio: new Date('2026-06-27T20:30:00-03:00'),
      },
      {
        timeA: 'Argélia',
        timeB: 'Áustria',
        dataInicio: new Date('2026-06-27T23:00:00-03:00'),
      },
      {
        timeA: 'Jordânia',
        timeB: 'Argentina',
        dataInicio: new Date('2026-06-27T23:00:00-03:00'),
      },
    ];

    for (const match of rodada3Partidas) {
      const timeAId = timesMap.get(match.timeA) ?? '';
      const timeBId = timesMap.get(match.timeB) ?? '';
      await db.insert(partidas).values({
        rodadaId: rodada3Id,
        timeAId,
        timeBId,
        dataInicio: match.dataInicio,
        status: 'AGENDADO',
      });
    }
    console.log('Todas as partidas da Rodada 3 criadas.');

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
