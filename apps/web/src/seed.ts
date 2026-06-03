import { db, palpites, partidas, rodadas, usuarios } from '@palpita/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

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

    // Limpar partidas e palpites antigos para rodar o seed de forma limpa
    await db.delete(palpites);
    await db.delete(partidas);

    // 4. Criar Partidas de Teste
    // Partida 1: Concluída (Passado) - Brasil vs Croácia
    const dataPassado = new Date();
    dataPassado.setHours(dataPassado.getHours() - 24); // 24 horas atrás

    const partidaFinalizada = await db
      .insert(partidas)
      .values({
        rodadaId,
        timeA: 'Brasil',
        timeB: 'Croácia',
        golsTimeA: 2,
        golsTimeB: 1,
        dataInicio: dataPassado,
        status: 'FINALIZADO',
      })
      .returning({ id: partidas.id });

    // Partida 2: Futura (Palpite Pendente) - Argentina vs França
    const dataFuturo1 = new Date();
    dataFuturo1.setDate(dataFuturo1.getDate() + 2); // Daqui a 2 dias

    const partidaPendente = await db
      .insert(partidas)
      .values({
        rodadaId,
        timeA: 'Argentina',
        timeB: 'França',
        dataInicio: dataFuturo1,
        status: 'AGENDADO',
      })
      .returning({ id: partidas.id });

    // Partida 3: Futura (Com Palpite Salvo) - Alemanha vs Espanha
    const dataFuturo2 = new Date();
    dataFuturo2.setDate(dataFuturo2.getDate() + 3); // Daqui a 3 dias

    const partidaComPalpite = await db
      .insert(partidas)
      .values({
        rodadaId,
        timeA: 'Alemanha',
        timeB: 'Espanha',
        dataInicio: dataFuturo2,
        status: 'AGENDADO',
      })
      .returning({ id: partidas.id });

    console.log('Partidas de teste criadas.');

    // 5. Criar Palpites de Teste
    // Competidor palpitou 2 x 1 no Brasil x Croácia (acertou exato -> 1 ponto)
    await db.insert(palpites).values({
      usuarioId: userId,
      partidaId: partidaFinalizada[0].id,
      golsTimeA: 2,
      golsTimeB: 1,
    });

    // Admin palpitou 1 x 0 no Brasil x Croácia (acertou vencedor -> 1 ponto pela regra de acerto simples)
    await db.insert(palpites).values({
      usuarioId: adminId,
      partidaId: partidaFinalizada[0].id,
      golsTimeA: 1,
      golsTimeB: 0,
    });

    // Competidor palpitou 2 x 2 no Alemanha x Espanha (futuro)
    await db.insert(palpites).values({
      usuarioId: userId,
      partidaId: partidaComPalpite[0].id,
      golsTimeA: 2,
      golsTimeB: 2,
    });

    console.log('Palpites de teste criados.');

    console.log('Seed finalizado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();
