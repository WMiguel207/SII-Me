import fodmap from './seed/fodmap.json';

export async function seedFodmap(db) {

  const resultado = await db.getFirstAsync(`
    SELECT COUNT(*) AS total
    FROM alimentos
  `);

  if (resultado?.total > 0) {
    return;
  }

  await db.execAsync('BEGIN TRANSACTION');

  try {

    for (const alimento of fodmap) {

      await db.runAsync(
        `
          INSERT INTO alimentos (
            nome,
            categoria,
            porcao,
            fodmap_score,
            descricao
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          alimento.nome,
          alimento.categoria ?? null,
          alimento.porcao ?? null,
          alimento.fodmap_score ?? 0,
          alimento.descricao ?? null
        ]
      );

    }

    await db.execAsync('COMMIT');

    console.log(
      `Seed FODMAP concluído: ${fodmap.length} alimentos inseridos.`
    );

  } catch (erro) {

    await db.execAsync('ROLLBACK');

    console.error(
      'Erro ao executar seed FODMAP:',
      erro
    );

    throw erro;
  }
}