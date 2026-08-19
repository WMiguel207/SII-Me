import { getDatabase } from './database';


export async function listarReceitas(pesquisa = '') {

  const db = await getDatabase();

  const texto = pesquisa.trim();


  if (texto === '') {

    return await db.getAllAsync(`
      SELECT
        id,
        nome,
        descricao,
        porcoes,
        modo_preparo

      FROM receitas

      ORDER BY nome ASC

      LIMIT 30
    `);
  }


  return await db.getAllAsync(
    `
      SELECT
        id,
        nome,
        descricao,
        porcoes,
        modo_preparo

      FROM receitas

      WHERE nome LIKE ?

      ORDER BY nome ASC

      LIMIT 30
    `,
    [`%${texto}%`]
  );
}


export async function buscarReceitaPorId(id) {

  const db = await getDatabase();

  return await db.getFirstAsync(
    `
      SELECT
        id,
        nome,
        descricao,
        porcoes,
        modo_preparo

      FROM receitas

      WHERE id = ?
    `,
    [id]
  );
}


export async function buscarReceitaCompleta(id) {

  const db = await getDatabase();


  const receita = await db.getFirstAsync(
    `
      SELECT
        id,
        nome,
        descricao,
        porcoes,
        modo_preparo

      FROM receitas

      WHERE id = ?
    `,
    [id]
  );


  if (!receita) {
    return null;
  }


  const ingredientes = await db.getAllAsync(
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
    [id]
  );


  return {
    ...receita,
    ingredientes
  };
}