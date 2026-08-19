import receitas from './seed/receitas.json';

export async function seedReceitas(db) {

  const resultado = await db.getFirstAsync(`
    SELECT COUNT(*) AS total
    FROM receitas
  `);

  if (resultado?.total > 0) {
    return;
  }

  await db.execAsync('BEGIN TRANSACTION');

  try {

    for (const receita of receitas) {

      const resultadoReceita = await db.runAsync(
        `
          INSERT INTO receitas (
            nome,
            descricao,
            porcoes,
            modo_preparo
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          receita.nome,
          receita.descricao ?? null,
          receita.porcoes ?? 1,
          receita.modo_preparo ?? null
        ]
      );

      const receitaId =
        resultadoReceita.lastInsertRowId;


      for (const ingrediente of receita.ingredientes ?? []) {

        const alimento = await db.getFirstAsync(
          `
            SELECT id
            FROM alimentos
            WHERE LOWER(nome) = LOWER(?)
            LIMIT 1
          `,
          [ingrediente.alimento]
        );


        if (!alimento) {

          console.warn(
            `Alimento não encontrado: "${ingrediente.alimento}" ` +
            `na receita "${receita.nome}"`
          );

          continue;
        }


        await db.runAsync(
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
            alimento.id,
            ingrediente.quantidade,
            ingrediente.unidade
          ]
        );
      }
    }

    await db.execAsync('COMMIT');

    console.log(
      `Seed de receitas concluído: ${receitas.length} receitas inseridas.`
    );

  } catch (erro) {

    await db.execAsync('ROLLBACK');

    console.error(
      'Erro ao executar seed de receitas:',
      erro
    );

    throw erro;
  }
}