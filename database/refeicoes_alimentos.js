import { getDatabase } from './database';


// =====================================================
// ADICIONAR ALIMENTO À REFEIÇÃO
// =====================================================

export async function adicionarAlimentoRefeicao({
  refeicaoId,
  alimentoId,
  quantidade = 0,
  score = 0,
}) {

  const db = await getDatabase();

  try {

    const resultado = await db.runAsync(
      `
      INSERT INTO refeicao_alimentos (
        refeicao_id,
        alimento_id,
        quantidade,
        score
      )
      VALUES (?, ?, ?, ?)
      `,
      refeicaoId,
      alimentoId,
      quantidade,
      score
    );

    return resultado.lastInsertRowId;

  } catch (error) {

    console.error(
      'Erro ao adicionar alimento à refeição:',
      error
    );

    throw error;
  }
}


// =====================================================
// LISTAR ALIMENTOS DE UMA REFEIÇÃO
// =====================================================

export async function listarAlimentosDaRefeicao(
  refeicaoId
) {

  const db = await getDatabase();

  try {

    return await db.getAllAsync(
      `
      SELECT
        ra.id,
        ra.refeicao_id,
        ra.alimento_id,
        ra.quantidade,
        ra.score,

        a.nome AS alimento_nome,
        a.categoria

      FROM refeicao_alimentos ra

      INNER JOIN alimentos a
        ON a.id = ra.alimento_id

      WHERE ra.refeicao_id = ?

      ORDER BY ra.id ASC
      `,
      refeicaoId
    );

  } catch (error) {

    console.error(
      'Erro ao listar alimentos da refeição:',
      error
    );

    throw error;
  }
}


// =====================================================
// REMOVER ALIMENTO DE UMA REFEIÇÃO
// =====================================================

export async function removerAlimentoRefeicao(
  id
) {

  const db = await getDatabase();

  try {

    await db.runAsync(
      `
      DELETE FROM refeicao_alimentos
      WHERE id = ?
      `,
      id
    );

  } catch (error) {

    console.error(
      'Erro ao remover alimento da refeição:',
      error
    );

    throw error;
  }
}