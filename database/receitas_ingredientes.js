import { getDatabase } from './database';


export async function listarIngredientesDaReceita(
  receitaId
) {

  const db = await getDatabase();

  return await db.getAllAsync(
    `
      SELECT
        ri.id,
        ri.receita_id,
        ri.alimento_id,

        a.nome AS alimento_nome,

        a.fodmap_score,

        COALESCE(
          ap.modificador,
          0
        ) AS modificador,

        (
          a.fodmap_score +
          COALESCE(ap.modificador, 0)
        ) AS score_pessoal,

        ri.quantidade,
        ri.unidade

      FROM receita_ingredientes ri

      INNER JOIN alimentos a
        ON a.id = ri.alimento_id

      LEFT JOIN alimentos_personalizados ap
        ON ap.alimento_id = a.id

      WHERE ri.receita_id = ?

      ORDER BY ri.id ASC
    `,
    [receitaId]
  );
}


export async function adicionarIngredienteReceita({
  receitaId,
  alimentoId,
  quantidade,
  unidade
}) {

  const db = await getDatabase();

  const resultado = await db.runAsync(
    `
      INSERT INTO receita_ingredientes (
        receita_id,
        alimento_id,
        quantidade,
        unidade
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      receitaId,
      alimentoId,
      quantidade,
      unidade
    ]
  );

  return resultado.lastInsertRowId;
}


export async function atualizarIngredienteReceita(
  id,
  {
    quantidade,
    unidade
  }
) {

  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE receita_ingredientes

      SET
        quantidade = ?,
        unidade = ?

      WHERE id = ?
    `,
    [
      quantidade,
      unidade,
      id
    ]
  );
}


export async function removerIngredienteReceita(id) {

  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM receita_ingredientes

      WHERE id = ?
    `,
    [id]
  );
}


export async function removerTodosIngredientesDaReceita(
  receitaId
) {

  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM receita_ingredientes

      WHERE receita_id = ?
    `,
    [receitaId]
  );
}