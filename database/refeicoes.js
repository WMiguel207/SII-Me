import { getDatabase } from './database';
import { adicionarAlimentoRefeicao, listarAlimentosDaRefeicao } from './refeicoes_alimentos';

// =====================================================
// CRIAR REFEIÇÃO
// =====================================================

export async function criarRefeicao({
  observacao = null,
  score = 0,
  alimentos = [],
}) {

  const db = await getDatabase();

  try {

    const data = new Date().toISOString();

    const resultado = await db.runAsync(
      `
      INSERT INTO refeicoes (
        data,
        observacao,
        score
      )
      VALUES (?, ?, ?)
      `,
      data,
      observacao,
      score
    );

    const refeicaoId = resultado.lastInsertRowId;

    // Adiciona os alimentos da refeição
    for (const alimento of alimentos) {

      await adicionarAlimentoRefeicao({
        refeicaoId,
        alimentoId: alimento.alimento_id,
        quantidade: alimento.quantidade,
        score: alimento.score,
      });

    }

    console.log(
      'Refeição criada:',
      refeicaoId
    );

    return refeicaoId;

  } catch (error) {

    console.error(
      'Erro ao criar refeição:',
      error
    );

    throw error;
  }
}


// =====================================================
// LISTAR REFEIÇÕES
// =====================================================

export async function listarRefeicoes() {

  const db = await getDatabase();

  try {

    return await db.getAllAsync(`
      SELECT
        id,
        data,
        observacao,
        score
      FROM refeicoes
      ORDER BY data DESC
    `);

  } catch (error) {

    console.error(
      'Erro ao listar refeições:',
      error
    );

    throw error;
  }
}


// =====================================================
// ÚLTIMA REFEIÇÃO
// =====================================================

export async function buscarUltimaRefeicao() {

  const db = await getDatabase();

  try {

    const resultado = await db.getFirstAsync(`
      SELECT
        id,
        data,
        observacao,
        score
      FROM refeicoes
      ORDER BY data DESC
      LIMIT 1
    `);

    if (!resultado) {
      return null;
    }

    const alimentos =
      await listarAlimentosDaRefeicao(
        resultado.id
      );

    return {
      ...resultado,
      alimentos,
    };

  } catch (error) {

    console.error(
      'Erro ao buscar última refeição:',
      error
    );

    throw error;
  }
}


// =====================================================
// REFEIÇÕES DE HOJE
// =====================================================

export async function listarRefeicoesHoje() {

  const db = await getDatabase();

  try {

    return await db.getAllAsync(`
      SELECT
        id,
        data,
        observacao,
        score
      FROM refeicoes
      WHERE date(data, 'localtime') = date('now', 'localtime')
      ORDER BY data DESC
    `);

  } catch (error) {

    console.error(
      'Erro ao listar refeições de hoje:',
      error
    );

    throw error;
  }
}


// =====================================================
// SCORE TOTAL DE HOJE
// =====================================================

export async function calcularScoreHoje() {

  const db = await getDatabase();

  try {

    const resultado = await db.getFirstAsync(`
      SELECT
        COALESCE(SUM(score), 0) AS score
      FROM refeicoes
      WHERE date(data, 'localtime') = date('now', 'localtime')
    `);

    return Number(resultado?.score || 0);

  } catch (error) {

    console.error(
      'Erro ao calcular score de hoje:',
      error
    );

    throw error;
  }
}


// =====================================================
// CONSUMO DOS ÚLTIMOS 7 DIAS
// =====================================================

export async function obterConsumoSemana() {

  const db = await getDatabase();

  try {

    const resultado = await db.getAllAsync(`
      SELECT
        date(data, 'localtime') AS dia,
        COALESCE(SUM(score), 0) AS score
      FROM refeicoes
      WHERE date(data, 'localtime')
        >= date('now', 'localtime', '-6 days')
      GROUP BY date(data, 'localtime')
      ORDER BY dia ASC
    `);

    return resultado.map(item => ({
      dia: item.dia,
      score: Number(item.score || 0),
    }));

  } catch (error) {

    console.error(
      'Erro ao obter consumo da semana:',
      error
    );

    throw error;
  }
}