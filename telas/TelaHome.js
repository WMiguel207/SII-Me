import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';

import Navigate from '../components/Navigate';

import {
  listarReceitas,
  buscarReceitaCompleta,
} from '../database/receitas';

import { listarAlimentos } from '../database/alimentos';

import {
  criarRefeicao,
  buscarUltimaRefeicao,
} from '../database/refeicoes';

import {
  adicionarRefeicao as adicionarRefeicaoHistorico,
  buscarHistoricoSemana,
} from '../database/historico';

export default function TelaHome({ navigation }) {

  const [pesquisa, setPesquisa] = useState('');
  const pesquisaInputRef = useRef(null);
  const [receitas, setReceitas] = useState([]);
  const [alimentos, setAlimentos] = useState([]);
  const [diasSemana, setDiasSemana] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [receitaSelecionada, setReceitaSelecionada] = useState(null);

  const [modalVisivel, setModalVisivel] = useState(false);

  const [tipoResultado, setTipoResultado] = useState('receitas');

  const [ultimaRefeicao, setUltimaRefeicao] = useState(null);

  const [scoreHoje, setScoreHoje] = useState(0);

  const [consumoSemana, setConsumoSemana] = useState([]);

  const [carregandoResumo, setCarregandoResumo] = useState(true);


  /*
   * Carrega as receitas inicialmente.
   */
  useFocusEffect(
  useCallback(() => {
    carregarReceitas();
    carregarDadosHome();
  }, [])
);

  /**
   * Formata uma data para o formato do banco de dados.
   */
function formatarDataBanco(data) {

  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, '0');

  const dia = String(
    data.getDate()
  ).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

/**Obter início da semana */
function obterInicioSemana(data = new Date()) {

  const resultado = new Date(data);

  resultado.setHours(0, 0, 0, 0);

  // Domingo = 0, então subtraímos getDay() para
  // sempre cair no domingo daquela semana.
  resultado.setDate(
    resultado.getDate() - resultado.getDay()
  );

  return resultado;
}

/**
 * calcular dia da semana
 */
function criarDiasSemana() {

  const inicio =
    obterInicioSemana();

  const dias = [];

  const nomesDias = [
    'D',
    'S',
    'T',
    'Q',
    'Q',
    'S',
    'S',
  ];

  for (let i = 0; i < 7; i++) {

    const data = new Date(inicio);

    data.setDate(
      inicio.getDate() + i
    );

    dias.push({

      data: formatarDataBanco(data),

      label:
        nomesDias[data.getDay()],

      score: 0,

    });
  }

  return dias;
}


  /*
   * Carrega os dados do resumo da tela inicial.
   */
 async function carregarDadosHome() {

  try {

    setCarregandoResumo(true);

    /*
     * Última refeição
     */
    const ultima =
      await buscarUltimaRefeicao();

    setUltimaRefeicao(ultima);


    /*
     * Cria os sete dias da semana.
     */
    const dias =
      criarDiasSemana();


    const inicio =
      dias[0].data;

    const fim =
      dias[6].data;


    /*
     * Busca as refeições do histórico
     * dentro da semana atual.
     */
    const historico =
      await buscarHistoricoSemana(
        inicio,
        fim
      );


    /*
     * Soma o score de cada dia.
     */
    historico.forEach(refeicao => {

      const dia =
        dias.find(
          item =>
            item.data === refeicao.data
        );

      if (dia) {

        dia.score +=
          Number(refeicao.score) || 0;

      }

    });


    /*
     * Score consumido hoje.
     */
    const hoje =
      formatarDataBanco(
        new Date()
      );

    const registroHoje =
      dias.find(
        dia => dia.data === hoje
      );

    setScoreHoje(
      registroHoje
        ? registroHoje.score
        : 0
    );


    /*
     * Atualiza o gráfico.
     */
    setDiasSemana(dias);

    setConsumoSemana(dias);

  } catch (erro) {

    console.error(
      'Erro ao carregar dados da Home:',
      erro
    );

  } finally {

    setCarregandoResumo(false);

  }
}

  /*
   * Carrega receitas.
   */
  async function carregarReceitas(texto = '') {
    try {
      setCarregando(true);

      const resultado = await listarReceitas(texto);

      setReceitas(resultado);
    } catch (erro) {
      console.error('Erro ao carregar receitas:', erro);

      Alert.alert(
        'Erro',
        'Não foi possível carregar as receitas.'
      );
    } finally {
      setCarregando(false);
    }
  }

  /*
   * Pesquisa receitas ou alimentos.
   */
  async function pesquisar(texto) {

    setPesquisa(texto);

    if (texto.trim() === '') {
      setTipoResultado('receitas');
      await carregarReceitas();
      return;
    }

    try {
      setCarregando(true);

      const textoPesquisa = texto.trim();

      const resultadoReceitas =
        await listarReceitas(textoPesquisa);

      let resultadoAlimentos = [];

      try {
        const todosAlimentos = await listarAlimentos();

        resultadoAlimentos = todosAlimentos.filter(
          alimento =>
            alimento.nome
              .toLowerCase()
              .includes(textoPesquisa.toLowerCase())
        );
      } catch (erro) {
        console.error(
          'Erro ao pesquisar alimentos:',
          erro
        );
      }

      /*
       * Se encontrou receitas, mostramos receitas.
       * Caso contrário, mostramos alimentos.
       */
      if (resultadoReceitas.length > 0) {

        setTipoResultado('receitas');
        setReceitas(resultadoReceitas);

      } else {

        setTipoResultado('alimentos');
        setAlimentos(resultadoAlimentos);
      }

    } catch (erro) {

      console.error(
        'Erro ao pesquisar:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível realizar a pesquisa.'
      );

    } finally {

      setCarregando(false);

    }
  }


  /*
   * Abre uma receita e busca todos os seus ingredientes.
   */
  async function abrirReceita(id) {

    try {

      setCarregando(true);

      const receita =
        await buscarReceitaCompleta(id);

      if (!receita) {
        Alert.alert(
          'Erro',
          'Receita não encontrada.'
        );

        return;
      }

      setReceitaSelecionada(receita);
      setModalVisivel(true);

    } catch (erro) {

      console.error(
        'Erro ao abrir receita:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível carregar os ingredientes.'
      );

    } finally {

      setCarregando(false);

    }
  }

  function calcularScoreReceita(receita) {

  if (
    !receita ||
    !receita.ingredientes ||
    receita.ingredientes.length === 0
  ) {
    return 0;
  }

  return receita.ingredientes.reduce(
    (total, ingrediente) => {

      const score =
        Number(ingrediente.score_pessoal) || 0;

      return total + score;

    },
    0
  );
}

  function formatarData(data) {

  if (!data) {
    return '';
  }

  const dataObj = new Date(data);

  const hoje = new Date();

  const mesmaData =
    dataObj.toDateString() ===
    hoje.toDateString();

  const hora =
    dataObj.toLocaleTimeString(
      'pt-BR',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  if (mesmaData) {
    return `Hoje, ${hora}`;
  }

  return dataObj.toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
    }
  ) + `, ${hora}`;
}

async function adicionarRefeicao() {

  if (!receitaSelecionada) {
    return;
  }

  const nomeReceita =
    receitaSelecionada.nome;

  try {

    setCarregando(true);


    /*
     * Ingredientes da receita.
     */
    const ingredientes =
      receitaSelecionada.ingredientes || [];


    /*
     * Prepara os alimentos para
     * a tabela detalhada de refeições.
     */
    const alimentos =
      ingredientes.map(
        ingrediente => ({

          alimento_id:
            ingrediente.alimento_id,

          quantidade:
            Number(
              ingrediente.quantidade
            ) || 0,

          score:
            Number(
              ingrediente.score_pessoal
            ) || 0,

        })
      );


    /*
     * Score total da receita.
     */
    const score =
      alimentos.reduce(
        (total, alimento) =>
          total + alimento.score,
        0
      );


    /*
     * Salva a refeição detalhada.
     */
    const refeicaoId =
      await criarRefeicao({

        observacao:
          nomeReceita,

        score,

        alimentos,

      });


    /*
     * Data atual no formato do SQLite.
     */
    const data =
      formatarDataBanco(
        new Date()
      );


    /*
     * Salva também no histórico.
     *
     * É essa tabela que alimentará
     * o gráfico semanal.
     */
    await adicionarRefeicaoHistorico({

      receitaId:
        receitaSelecionada.id,

      data,

      porcoesConsumidas: 1,

      score,

    });


    console.log(
      'Refeição registrada:',
      refeicaoId
    );


    /*
     * Fecha o modal.
     */
    setModalVisivel(false);

    setReceitaSelecionada(null);


    /*
     * Atualiza imediatamente:
     *
     * - score de hoje
     * - gráfico
     * - última refeição
     */
    await carregarDadosHome();


    Alert.alert(
      'Refeição adicionada',
      `"${nomeReceita}" foi registrada com sucesso.`
    );

  } catch (erro) {

    console.error(
      'Erro ao adicionar refeição:',
      erro
    );

    Alert.alert(
      'Erro',
      'Não foi possível registrar a refeição.'
    );

  } finally {

    setCarregando(false);

  }
}

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Cabeçalho */}

        <View style={styles.header}>

          <View>

            <Text style={styles.greeting}>
              Bom dia!
            </Text>

            <Text style={styles.headerSubtitle}>
              Como está seu estômago hoje?
            </Text>

          </View>

        </View>


        {/* Pesquisa */}

        <View style={styles.searchContainer}>

          <Text style={styles.searchIcon}>
            ⌕
          </Text>

          <TextInput
            ref={pesquisaInputRef}
            style={styles.searchInput}
            placeholder="Pesquisar receita ou alimento..."
            placeholderTextColor="#8B9997"
            value={pesquisa}
            onChangeText={pesquisar}
          />

        </View>


        {/* Resultados da pesquisa */}

        {pesquisa.trim() !== '' && (

          <View style={styles.resultsSection}>

            <Text style={styles.sectionTitle}>
              {tipoResultado === 'receitas'
                ? 'Receitas encontradas'
                : 'Alimentos encontrados'}
            </Text>


            {carregando && (

              <ActivityIndicator
                size="small"
                color="#4F8A7A"
                style={styles.loading}
              />

            )}


            {!carregando &&
              tipoResultado === 'receitas' &&
              receitas.length === 0 && (

                <Text style={styles.emptyText}>
                  Nenhuma receita encontrada.
                </Text>

              )}


            {!carregando &&
              tipoResultado === 'alimentos' &&
              alimentos.length === 0 && (

                <Text style={styles.emptyText}>
                  Nenhum alimento encontrado.
                </Text>

              )}


            {tipoResultado === 'receitas' &&
              receitas.map(receita => (

                <TouchableOpacity
                  key={receita.id}
                  style={styles.resultCard}
                  onPress={() =>
                    abrirReceita(receita.id)
                  }
                >

                  <View style={styles.resultIcon}>
                    <Text>
                      🍽️
                    </Text>
                  </View>

                  <View style={styles.resultInfo}>

                    <Text style={styles.resultTitle}>
                      {receita.nome}
                    </Text>

                    <Text style={styles.resultSubtitle}>
                      {receita.porcoes}{' '}
                      {receita.porcoes === 1 ? 'porção' : 'porções'}
                    </Text>

                  </View>

                  <Text style={styles.resultArrow}>
                    ›
                  </Text>

                </TouchableOpacity>

              ))}


            {tipoResultado === 'alimentos' &&
              alimentos.map(alimento => (

                <View
                  key={alimento.id}
                  style={styles.resultCard}
                >

                  <View style={styles.resultIcon}>
                    <Text>
                      🥗
                    </Text>
                  </View>

                  <View style={styles.resultInfo}>

                    <Text style={styles.resultTitle}>
                      {alimento.nome}
                    </Text>

                    <Text style={styles.resultSubtitle}>
                      FODMAP: {alimento.score_pessoal}
                    </Text>

                  </View>

                </View>

              ))}

          </View>

        )}


        {/* Resumo */}

        <Text style={styles.sectionTitle}>
          Resumo de hoje
        </Text>

        <View style={styles.summaryCard}>

          <View style={styles.summaryLeft}>

            <Text style={styles.summaryLabel}>
              Nível de agressividade
            </Text>

            <Text style={styles.summaryScore}>
              {carregandoResumo ? '...' : scoreHoje}
            </Text>

            <Text style={styles.summaryDescription}>
              {scoreHoje === 0
                ? 'Nenhuma quantia de FODMAP registrada'
                : scoreHoje <= 10
                  ? 'Baixo risco'
                  : scoreHoje <= 20
                    ? 'Atenção'
                    : 'Alto risco'}
            </Text>

          </View>

          <View style={styles.statusCircle}>

            <Text style={styles.statusIcon}>
              ✓
            </Text>

          </View>

        </View>


        {/* Gráfico */}

        <View style={styles.chartHeader}>

          <Text style={styles.sectionTitle}>
            Consumo da semana
          </Text>

          <Text style={styles.chartPeriod}>
            Esta semana
          </Text>

        </View>


        <View style={styles.chartCard}>

  <View style={styles.chartArea}>

    {diasSemana.map((dia) => {

      const score =
        Number(dia.score) || 0;


      /*
       * Altura da barra.
       *
       * 0 = barra pequena
       * valores maiores = barra maior
       *
       * Limite em 110 para não
       * estourar o card.
       */
      const altura =
        score === 0
          ? 5
          : Math.min(
              110,
              Math.max(
                15,
                score * 5
              )
            );


      return (
        <View
          key={dia.data}
          style={styles.chartColumn}
        >

          <Text style={styles.chartScore}>
            {score > 0 ? score : ''}
          </Text>

          <View
            style={[
              styles.bar,
              {
                height: altura,
              },
            ]}
          />

        </View>
      );

    })}

  </View>


  <View style={styles.days}>

    {diasSemana.map(dia => (

      <Text
        key={dia.data}
        style={styles.day}
      >
        {dia.label}
      </Text>

    ))}

  </View>

</View>


        {/* Última refeição */}
        
        <Text style={styles.sectionTitle}>
          Última refeição
        </Text>



        {ultimaRefeicao ? (
          <TouchableOpacity onPress={() => navigation.navigate('TelaUsuario')}>
        <View style={styles.mealCard}>

          <View style={styles.mealIcon}>
            <Text>
              🍽️
            </Text>
          </View>


          <View style={styles.mealInfo}>

            <Text style={styles.mealTitle}>
              {ultimaRefeicao.observacao ||
                'Refeição'}
            </Text>

            <Text style={styles.mealTime}>
              {formatarData(
                ultimaRefeicao.data
              )}
            </Text>

          </View>


          <View style={styles.mealScore}>

            <Text style={styles.mealScoreNumber}>
              {ultimaRefeicao.score}
            </Text>

            <Text style={styles.mealScoreText}>
              {ultimaRefeicao.score <= 10
                ? 'Baixo'
                : ultimaRefeicao.score <= 20
                  ? 'Atenção'
                  : 'Alto'}
            </Text>

          </View>

        </View>
        </TouchableOpacity>

      ) : (
        <TouchableOpacity
          onPress={() => {
            pesquisaInputRef.current?.focus();
          }}
        >

        <View style={styles.mealCard}>

          <View style={styles.mealIcon}>
            <Text>
              🍽️
            </Text>
          </View>

          <View style={styles.mealInfo}>

            <Text style={styles.mealTitle}>
              Nenhuma refeição
            </Text>

            <Text style={styles.mealTime}>
              Adicione sua primeira refeição
            </Text>

          </View>

        </View>
</TouchableOpacity>
      )}


        {/* Botão */}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            pesquisaInputRef.current?.focus();
          }}
        >

          <Text style={styles.addButtonText}>
            +
          </Text>

          <Text style={styles.addButtonLabel}>
            Adicionar refeição
          </Text>

        </TouchableOpacity>

      </ScrollView>


      {/* Modal da receita */}

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() =>
          setModalVisivel(false)
        }
      >

        <View style={styles.modalBackground}>

          <View style={styles.modalContainer}>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >

              {receitaSelecionada && (

                <>

                  <View style={styles.modalHeader}>

                    <Text style={styles.modalTitle}>
                      {receitaSelecionada.nome}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        setModalVisivel(false)
                      }
                    >

                      <Text style={styles.closeButton}>
                        ×
                      </Text>

                    </TouchableOpacity>

                  </View>


                  {receitaSelecionada.descricao && (

                    <Text style={styles.modalDescription}>
                      {receitaSelecionada.descricao}
                    </Text>

                  )}


                  <View style={styles.recipeInfo}>

                  <Text style={styles.recipeInfoText}>
                    🍽️ {receitaSelecionada.porcoes}{' '}
                    {Number(receitaSelecionada.porcoes) === 1
                      ? 'porção'
                      : 'porções'}
                  </Text>

                  <Text style={styles.recipeScore}>
                    FODMAP total:{' '}
                    {calcularScoreReceita(
                      receitaSelecionada
                    )}
                  </Text>

                </View>


                  <Text style={styles.modalSectionTitle}>
                    Ingredientes
                  </Text>


                  {receitaSelecionada.ingredientes.map(
                    ingrediente => (

                      <View
                        key={ingrediente.id}
                        style={styles.ingredientRow}
                      >

                        <View style={styles.ingredientInfo}>

                          <Text style={styles.ingredientName}>
                            {ingrediente.alimento_nome}
                          </Text>

                          <Text style={styles.ingredientQuantity}>
                            {ingrediente.quantidade}{' '}
                            {ingrediente.unidade}
                          </Text>

                        </View>

                        <View style={styles.ingredientScore}>

                          <Text style={styles.ingredientScoreNumber}>
                            {ingrediente.score_pessoal}
                          </Text>

                          <Text style={styles.ingredientScoreLabel}>
                            FODMAP
                          </Text>

                        </View>

                      </View>

                    )
                  )}


                  {receitaSelecionada.modo_preparo && (

                    <>

                      <Text style={styles.modalSectionTitle}>
                        Modo de preparo
                      </Text>

                      <Text style={styles.preparation}>
                        {receitaSelecionada.modo_preparo}
                      </Text>

                    </>

                  )}


                  <TouchableOpacity
                    style={styles.modalAddButton}
                    onPress={adicionarRefeicao}
                  >

                    <Text style={styles.modalAddButtonText}>
                      Adicionar esta refeição
                    </Text>

                  </TouchableOpacity>

                </>

              )}

            </ScrollView>

          </View>

        </View>

      </Modal>


      {/* Navegação inferior */}

      <Navigate navigation={navigation} />

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8F9F6',
  },

  content: {
    padding: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 22,
  },

  greeting: {
    fontSize: 27,
    fontWeight: '700',
    color: '#2F3A3A',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#718080',
  },

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  searchIcon: {
    fontSize: 27,
    color: '#718080',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2F3A3A',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F3A3A',
    marginBottom: 12,
  },

  resultsSection: {
    marginBottom: 25,
  },

  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  resultIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },

  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F3A3A',
  },

  resultSubtitle: {
    fontSize: 12,
    color: '#8B9997',
    marginTop: 3,
  },

  resultArrow: {
    fontSize: 25,
    color: '#8B9997',
  },

  loading: {
    marginVertical: 15,
  },

  emptyText: {
    color: '#8B9997',
    fontSize: 14,
    marginBottom: 15,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  summaryLeft: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 13,
    color: '#718080',
  },

  summaryScore: {
    fontSize: 34,
    fontWeight: '700',
    color: '#4F8A7A',
    marginTop: 2,
  },

  summaryDescription: {
    fontSize: 13,
    color: '#67A77F',
    fontWeight: '600',
  },

  statusCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#DCEFE8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusIcon: {
    fontSize: 25,
    color: '#4F8A7A',
  },

  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  chartPeriod: {
    fontSize: 12,
    color: '#718080',
    marginBottom: 12,
  },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  chartArea: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },

  chartColumn: {
    flex: 1,
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  chartScore: {
    fontSize: 9,
    color: '#718080',
    marginBottom: 3,
  },

  bar: {
    width: 22,
    borderRadius: 8,
    backgroundColor: '#4F8A7A',
  },

  days: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },

  day: {
    fontSize: 12,
    color: '#8B9997',
  },

  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  mealIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#F1F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mealInfo: {
    flex: 1,
    marginLeft: 12,
  },

  mealTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F3A3A',
  },

  mealTime: {
    fontSize: 12,
    color: '#8B9997',
    marginTop: 4,
  },

  mealScore: {
    alignItems: 'center',
  },

  mealScoreNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4F8A7A',
  },

  mealScoreText: {
    fontSize: 10,
    color: '#67A77F',
  },

  addButton: {
    height: 55,
    borderRadius: 17,
    backgroundColor: '#4F8A7A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  addButtonText: {
    fontSize: 26,
    color: '#FFFFFF',
    marginRight: 8,
  },

  addButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    maxHeight: '90%',
    backgroundColor: '#F8F9F6',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  modalTitle: {
    flex: 1,
    fontSize: 23,
    fontWeight: '700',
    color: '#2F3A3A',
    marginRight: 10,
  },

  closeButton: {
    fontSize: 32,
    color: '#718080',
    lineHeight: 32,
  },

  modalDescription: {
    fontSize: 14,
    color: '#718080',
    lineHeight: 21,
    marginBottom: 15,
  },

  recipeInfo: {
    backgroundColor: '#DCEFE8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  recipeInfoText: {
    fontSize: 13,
    color: '#4F8A7A',
    fontWeight: '600',
  },

  recipeScore: {
    fontSize: 13,
    color: '#4F8A7A',
    fontWeight: '600',
    marginTop: 5,
  },

  modalSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2F3A3A',
    marginBottom: 10,
  },

  ingredientRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  ingredientInfo: {
    flex: 1,
  },

  ingredientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F3A3A',
  },

  ingredientQuantity: {
    fontSize: 12,
    color: '#8B9997',
    marginTop: 3,
  },

  ingredientScore: {
    alignItems: 'center',
    marginLeft: 10,
  },

  ingredientScoreNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4F8A7A',
  },

  ingredientScoreLabel: {
    fontSize: 9,
    color: '#8B9997',
  },

  preparation: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    fontSize: 14,
    color: '#4F5B5A',
    lineHeight: 21,
    marginBottom: 20,
  },

  modalAddButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#4F8A7A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalAddButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});