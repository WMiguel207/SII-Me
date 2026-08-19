import { getDatabase } from './database';


export async function listarAlimentos() {

  const db = await getDatabase();

  return await db.getAllAsync(`
    SELECT
      a.id,
      a.nome,
      a.categoria,
      a.porcao,
      a.fodmap_score,
      a.descricao,

      COALESCE(
        ap.modificador,
        0
      ) AS modificador,

      (
        a.fodmap_score +
        COALESCE(ap.modificador, 0)
      ) AS score_pessoal

    FROM alimentos a

    LEFT JOIN alimentos_personalizados ap
      ON ap.alimento_id = a.id

    ORDER BY a.nome ASC
  `);
}


export async function buscarAlimentos(pesquisa = '') {

  const db = await getDatabase();

  return await db.getAllAsync(
    `
      SELECT
        a.id,
        a.nome,
        a.categoria,
        a.porcao,
        a.fodmap_score,

        COALESCE(
          ap.modificador,
          0
        ) AS modificador,

        (
          a.fodmap_score +
          COALESCE(ap.modificador, 0)
        ) AS score_pessoal

      FROM alimentos a

      LEFT JOIN alimentos_personalizados ap
        ON ap.alimento_id = a.id

      WHERE a.nome LIKE ?

      ORDER BY a.nome ASC

      LIMIT 30
    `,
    [`%${pesquisa.trim()}%`]
  );
}