import * as SQLite from 'expo-sqlite';

import { seedFodmap } from './seedFodmap';
import { seedReceitas } from './seedReceitas';


let db = null;
let dbReadyPromise = null;
let inicializado = false;
let inicializando = false;

export async function resetDatabase() {

  // Garante que qualquer inicialização em andamento termine antes de resetar
  await getDatabase();

  dbReadyPromise = (async () => {

    await db.execAsync(`
      PRAGMA foreign_keys = OFF;

      DROP TABLE IF EXISTS receita_ingredientes;
      DROP TABLE IF EXISTS receitas;
      DROP TABLE IF EXISTS alimentos_personalizados;
      DROP TABLE IF EXISTS alimentos;
      DROP TABLE IF EXISTS refeicao_alimentos;
      DROP TABLE IF EXISTS refeicoes;
      DROP TABLE IF EXISTS historico_refeicoes;

      PRAGMA foreign_keys = ON;
    `);

    await inicializarDatabase();

  })();

  try {
    await dbReadyPromise;
    console.log('Database resetada com sucesso.');
  } catch (error) {
    console.error('Erro ao resetar database:', error);
    throw error;
  }
}

export async function getDatabase() {

  if (!db) {
    db = await SQLite.openDatabaseAsync('siime.db');
  }

  if (!dbReadyPromise) {
    dbReadyPromise = inicializarDatabase();
  }

  await dbReadyPromise;

  return db;
}


async function inicializarDatabase() {

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS alimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT,
      porcao INTEGER,
      fodmap_score INTEGER NOT NULL DEFAULT 0,
      descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS historico_refeicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      receita_id INTEGER,

      data TEXT NOT NULL,

      porcoes_consumidas REAL NOT NULL DEFAULT 1,

      score REAL NOT NULL DEFAULT 0,

      FOREIGN KEY (receita_id)
        REFERENCES receitas(id)
    );

    CREATE TABLE IF NOT EXISTS alimentos_personalizados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alimento_id INTEGER NOT NULL UNIQUE,
      modificador REAL NOT NULL DEFAULT 0,
      observacao TEXT,

      FOREIGN KEY (alimento_id)
        REFERENCES alimentos(id)
        ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      porcoes INTEGER NOT NULL DEFAULT 1,
      modo_preparo TEXT
    );


    CREATE TABLE IF NOT EXISTS receita_ingredientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receita_id INTEGER NOT NULL,
      alimento_id INTEGER NOT NULL,
      quantidade REAL NOT NULL,
      unidade TEXT NOT NULL,

      FOREIGN KEY (receita_id)
        REFERENCES receitas(id)
        ON DELETE CASCADE,

      FOREIGN KEY (alimento_id)
        REFERENCES alimentos(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS refeicoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    observacao TEXT,
    score REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS refeicao_alimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    refeicao_id INTEGER NOT NULL,

    alimento_id INTEGER NOT NULL,

    quantidade REAL NOT NULL DEFAULT 0,

    score REAL NOT NULL DEFAULT 0,

    FOREIGN KEY (refeicao_id)
        REFERENCES refeicoes(id)
        ON DELETE CASCADE,

    FOREIGN KEY (alimento_id)
        REFERENCES alimentos(id)
        ON DELETE CASCADE
);
  `);


  // Primeiro os alimentos.
  await seedFodmap(db);

  // Depois as receitas, que dependem dos alimentos.
  await seedReceitas(db);


  console.log(
    'Banco de dados inicializado com sucesso.'
  );
}


export async function resetarTabelaPersonalizacoes() {

  if (!db) {
    db = await SQLite.openDatabaseAsync('siime.db');
  }


  await db.execAsync(`
    DROP TABLE IF EXISTS alimentos_personalizados;

    CREATE TABLE alimentos_personalizados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      alimento_id INTEGER NOT NULL UNIQUE,

      modificador REAL NOT NULL DEFAULT 0,

      observacao TEXT,

      FOREIGN KEY (alimento_id)
        REFERENCES alimentos(id)
        ON DELETE CASCADE
    );
  `);


  console.log(
    'Tabela de personalizações recriada.'
  );
}