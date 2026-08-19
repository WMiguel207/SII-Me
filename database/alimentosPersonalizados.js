import { getDatabase } from './database';


// ==========================================
// BUSCAR MODIFICADOR DE UM ALIMENTO
// ==========================================

export async function buscarModificador(alimentoId) {

  const db = await getDatabase();

  const resultado = await db.getFirstAsync(
    `
    SELECT *
    FROM alimentos_personalizados
    WHERE alimento_id = ?
    `,
    alimentoId
  );

  return resultado || null;
}


// ==========================================
// SALVAR / ATUALIZAR MODIFICADOR
// ==========================================

export async function salvarModificador(
  alimentoId,
  modificador
) {

  const db = await getDatabase();

  await db.runAsync(
    `
    INSERT INTO alimentos_personalizados
    (
      alimento_id,
      modificador
    )
    VALUES (?, ?)

    ON CONFLICT(alimento_id)
    DO UPDATE SET
      modificador = excluded.modificador
    `,
    alimentoId,
    modificador
  );
}


// ==========================================
// REMOVER MODIFICADOR
// ==========================================

export async function removerModificador(alimentoId) {

  const db = await getDatabase();

  await db.runAsync(
    `
    DELETE FROM alimentos_personalizados
    WHERE alimento_id = ?
    `,
    alimentoId
  );
}


// ==========================================
// LISTAR MODIFICADORES
// ==========================================

export async function listarModificadores() {

  const db = await getDatabase();

  return await db.getAllAsync(`
    SELECT *
    FROM alimentos_personalizados
    ORDER BY alimento_id ASC
  `);
}