import { getDatabase } from './database';


// ==========================================
// ADICIONAR REFEIÇÃO AO HISTÓRICO
// ==========================================

export async function adicionarRefeicao({
  receitaId,
  data,
  porcoesConsumidas = 1,
  score = 0,
}) {

  const db = await getDatabase();

  const resultado = await db.runAsync(
    `
    INSERT INTO historico_refeicoes
    (
      receita_id,
      data,
      porcoes_consumidas,
      score
    )
    VALUES (?, ?, ?, ?)
    `,
    receitaId,
    data,
    porcoesConsumidas,
    score
  );

  return resultado.lastInsertRowId;
}


// ==========================================
// BUSCAR HISTÓRICO
// ==========================================

export async function listarHistorico() {

  const db = await getDatabase();

  return await db.getAllAsync(`
    SELECT
      historico_refeicoes.*,

      receitas.nome AS receita_nome

    FROM historico_refeicoes

    LEFT JOIN receitas
      ON receitas.id =
         historico_refeicoes.receita_id

    ORDER BY historico_refeicoes.data DESC
  `);
}


// ==========================================
// HISTÓRICO DE UM DIA
// ==========================================

export async function buscarHistoricoPorData(data) {

  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT
      historico_refeicoes.*,

      receitas.nome AS receita_nome

    FROM historico_refeicoes

    LEFT JOIN receitas
      ON receitas.id =
         historico_refeicoes.receita_id

    WHERE historico_refeicoes.data = ?

    ORDER BY historico_refeicoes.id DESC
    `,
    data
  );
}


// ==========================================
// HISTÓRICO DA SEMANA
// ==========================================

export async function buscarHistoricoSemana(
  inicio,
  fim
) {

  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT
      historico_refeicoes.*,

      receitas.nome AS receita_nome

    FROM historico_refeicoes

    LEFT JOIN receitas
      ON receitas.id =
         historico_refeicoes.receita_id

    WHERE historico_refeicoes.data
      BETWEEN ? AND ?

    ORDER BY historico_refeicoes.data ASC
    `,
    inicio,
    fim
  );
}