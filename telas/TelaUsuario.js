import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import Navigate from '../components/Navigate';

import {
  listarHistorico,
} from '../database/historico';

export default function TelaUsuario({ navigation }) {

  const [historico, setHistorico] = useState([]);

  const [carregando, setCarregando] = useState(true);


  // =====================================================
  // CARREGAR HISTÓRICO
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [])
  );


  async function carregarHistorico() {

    try {

      setCarregando(true);

      const resultado = await listarHistorico();

      setHistorico(resultado || []);

    } catch (erro) {

      console.error(
        'Erro ao carregar histórico:',
        erro
      );

      setHistorico([]);

    } finally {

      setCarregando(false);

    }
  }


  // =====================================================
  // DATA ATUAL
  // =====================================================

 function obterInicioSemana() {

  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  /*
   * getDay():
   *
   * 0 = domingo
   * 1 = segunda
   * 2 = terça
   * 3 = quarta
   * 4 = quinta
   * 5 = sexta
   * 6 = sábado
   *
   * Queremos sempre começar no domingo.
   */

  const inicio = new Date(hoje);

  inicio.setDate(
    hoje.getDate() - hoje.getDay()
  );

  return inicio;
}


  // =====================================================
  // NORMALIZAR DATA DO BANCO
  // =====================================================

  function converterData(data) {
  if (!data) return null;

  // Se vier só "YYYY-MM-DD", força interpretação como horário local
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia); // local, não UTC
  }

  const dataObj = new Date(data);
  return isNaN(dataObj.getTime()) ? null : dataObj;
}

  // =====================================================
  // HISTÓRICO DOS ÚLTIMOS 7 DIAS
  // =====================================================

 function obterHistoricoSemana() {

  const inicio = obterInicioSemana();

  inicio.setHours(
    0,
    0,
    0,
    0
  );

  /*
   * O fim da semana é sábado.
   */

  const fim = new Date(inicio);

  fim.setDate(
    inicio.getDate() + 6
  );

  fim.setHours(
    23,
    59,
    59,
    999
  );

  return historico.filter(refeicao => {

    const data =
      converterData(refeicao.data);

    if (!data) {
      return false;
    }

    return (
      data >= inicio &&
      data <= fim
    );

  });
}


  // =====================================================
  // GERAR OS 7 DIAS DO GRÁFICO
  // =====================================================

 function gerarDiasSemana() {

  const inicio =
    obterInicioSemana();

  const dias = [];

  /*
   * Domingo até sábado.
   */

  for (let i = 0; i < 7; i++) {

    const data =
      new Date(inicio);

    data.setDate(
      inicio.getDate() + i
    );

    dias.push(data);

  }

  return dias;
}


  // =====================================================
  // SCORE DE UM DIA
  // =====================================================

  function calcularScoreDia(dataReferencia) {

    const ano =
      dataReferencia.getFullYear();

    const mes =
      dataReferencia.getMonth();

    const dia =
      dataReferencia.getDate();


    return obterHistoricoSemana()
      .filter(refeicao => {

        const data =
          converterData(refeicao.data);

        if (!data) {
          return false;
        }

        return (
          data.getFullYear() === ano &&
          data.getMonth() === mes &&
          data.getDate() === dia
        );

      })
      .reduce(
        (total, refeicao) =>
          total +
          (Number(refeicao.score) || 0),
        0
      );
  }


  // =====================================================
  // DADOS DO GRÁFICO
  // =====================================================

  function obterDadosGrafico() {

    const dias = gerarDiasSemana();

    return dias.map(data => {

      const score =
        calcularScoreDia(data);

      return {
        data,
        score,
      };

    });

  }


  // =====================================================
  // RESUMO DA SEMANA
  // =====================================================

  function obterResumoSemana() {

    const semana =
      obterHistoricoSemana();


    const refeicoes =
      semana.length;


    const pontos =
      semana.reduce(
        (total, refeicao) =>
          total +
          (Number(refeicao.score) || 0),
        0
      );


    const baixoRisco =
      semana.filter(
        refeicao =>
          Number(refeicao.score) <= 10
      ).length;


    return {
      refeicoes,
      pontos,
      baixoRisco,
    };

  }


  // =====================================================
  // STATUS DA SEMANA
  // =====================================================

  function obterStatusSemana() {

    const semana =
      obterHistoricoSemana();


    if (semana.length === 0) {

      return {
        titulo: 'Sem dados suficientes',
        descricao:
          'Adicione refeições para acompanhar sua evolução.',
      };

    }


    const media =
      semana.reduce(
        (total, refeicao) =>
          total +
          (Number(refeicao.score) || 0),
        0
      ) / semana.length;


    if (media <= 10) {

      return {
        titulo: 'Semana estável',
        descricao:
          'Seu consumo apresentou baixo risco na maior parte da semana.',
      };

    }


    if (media <= 20) {

      return {
        titulo: 'Semana moderada',
        descricao:
          'Seu consumo apresentou níveis moderados de agressividade.',
      };

    }


    return {
      titulo: 'Atenção ao consumo',
      descricao:
        'Sua média de agressividade esteve elevada nesta semana.',
    };

  }


  // =====================================================
  // FORMATAR DATA
  // =====================================================

  function formatarData(data) {

    const dataObj =
      converterData(data);

    if (!dataObj) {
      return '';
    }


    const agora =
      new Date();


    const hoje =
      new Date();

    hoje.setHours(
      0,
      0,
      0,
      0
    );


    const ontem =
      new Date(hoje);

    ontem.setDate(
      ontem.getDate() - 1
    );


    const dataComparacao =
      new Date(dataObj);

    dataComparacao.setHours(
      0,
      0,
      0,
      0
    );


    const hora =
      dataObj.toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );


    if (
      dataComparacao.getTime() ===
      hoje.getTime()
    ) {

      return `Hoje, ${hora}`;

    }


    if (
      dataComparacao.getTime() ===
      ontem.getTime()
    ) {

      return `Ontem, ${hora}`;

    }


    return (
      dataObj.toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: '2-digit',
        }
      ) +
      `, ${hora}`
    );

  }


  // =====================================================
  // NOME DO DIA
  // =====================================================

 function nomeDia(data) {

  const dias = [
    'D',
    'S',
    'T',
    'Q',
    'Q',
    'S',
    'S',
  ];

  return dias[data.getDay()];
}


  // =====================================================
  // ALTURA DA BARRA
  // =====================================================

  function calcularAlturaBarra(score, maiorScore) {

    if (score <= 0) {
      return 5;
    }


    if (maiorScore <= 0) {
      return 5;
    }


    const altura =
      (score / maiorScore) * 110;


    return Math.max(
      15,
      Math.min(
        110,
        altura
      )
    );

  }


  // =====================================================
  // RENDER
  // =====================================================

  const resumo =
    obterResumoSemana();


  const dadosGrafico =
    obterDadosGrafico();


  const maiorScore =
    Math.max(
      ...dadosGrafico.map(
        item => item.score
      ),
      0
    );


  const status =
    obterStatusSemana();


  /*
   * As refeições mais recentes.
   */

  const refeicoesRecentes =
    historico.slice(0, 10);


  return (

    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ==========================================
            CABEÇALHO
        ========================================== */}

        <View style={styles.header}>

          <View>

            <Text style={styles.title}>
              Meu histórico
            </Text>

            <Text style={styles.subtitle}>
              Acompanhe seu consumo e sua evolução
            </Text>

          </View>

        </View>


        {carregando ? (

          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="large"
              color="#4F8A7A"
            />

            <Text style={styles.loadingText}>
              Carregando histórico...
            </Text>

          </View>

        ) : (

          <>

            {/* ======================================
                RESUMO
            ====================================== */}

            <Text style={styles.sectionTitle}>
              Esta semana
            </Text>


            <View style={styles.summaryRow}>

              <View style={styles.summaryCard}>

                <Text style={styles.summaryNumber}>
                  {resumo.refeicoes}
                </Text>

                <Text style={styles.summaryLabel}>
                  Refeições
                </Text>

              </View>


              <View style={styles.summaryCard}>

                <Text style={styles.summaryNumber}>
                  {resumo.pontos}
                </Text>

                <Text style={styles.summaryLabel}>
                  Pontos
                </Text>

              </View>


              <View style={styles.summaryCard}>

                <Text style={styles.summaryNumber}>
                  {resumo.baixoRisco}
                </Text>

                <Text style={styles.summaryLabel}>
                  Baixo risco
                </Text>

              </View>

            </View>


            {/* ======================================
                GRÁFICO
            ====================================== */}

            <View style={styles.chartHeader}>

              <Text style={styles.sectionTitle}>
                Agressividade
              </Text>

              <Text style={styles.period}>
                Esta semana
              </Text>

            </View>


            <View style={styles.chartCard}>

              <View style={styles.chartArea}>

                {dadosGrafico.map(
                  (item, index) => {

                    const altura =
                      calcularAlturaBarra(
                        item.score,
                        maiorScore
                      );


                    return (

                      <View
                        key={index}
                        style={styles.chartColumn}
                      >

                        <View
                          style={[
                            styles.bar,
                            {
                              height: altura,
                            },
                          ]}
                        />

                        <Text style={styles.day}>
                          {nomeDia(item.data)}
                        </Text>

                      </View>

                    );

                  }
                )}

              </View>

            </View>


            {/* ======================================
                STATUS
            ====================================== */}

            <View style={styles.statusCard}>

              <View style={styles.statusCircle}>

                <Text style={styles.statusIcon}>
                  ✓
                </Text>

              </View>


              <View style={styles.statusInfo}>

                <Text style={styles.statusTitle}>
                  {status.titulo}
                </Text>

                <Text style={styles.statusDescription}>
                  {status.descricao}
                </Text>

              </View>

            </View>


            {/* ======================================
                HISTÓRICO
            ====================================== */}

            <Text style={styles.sectionTitle}>
              Refeições recentes
            </Text>


            {refeicoesRecentes.length === 0 ? (

              <View style={styles.emptyCard}>

                <Text style={styles.emptyTitle}>
                  Nenhuma refeição registrada
                </Text>

                <Text style={styles.emptyDescription}>
                  Suas refeições aparecerão aqui.
                </Text>

              </View>

            ) : (

              refeicoesRecentes.map(
                (refeicao, index) => (

                  <View
                    key={
                      refeicao.id ||
                      index
                    }
                    style={styles.mealCard}
                  >

                    <View style={styles.mealIcon}>

                      <Text>
                        🍽️
                      </Text>

                    </View>


                    <View style={styles.mealInfo}>

                      <Text
                        style={styles.mealTitle}
                        numberOfLines={1}
                      >
                        {refeicao.receita_nome ||
                          'Refeição'}
                      </Text>

                      <Text style={styles.mealDate}>
                        {formatarData(
                          refeicao.data
                        )}
                      </Text>

                    </View>


                    <View style={styles.score}>

                      <Text style={styles.scoreNumber}>
                        {Number(
                          refeicao.score
                        ) || 0}
                      </Text>

                      <Text style={styles.scoreLabel}>
                        {Number(
                          refeicao.score
                        ) <= 10
                          ? 'Baixo'
                          : Number(
                              refeicao.score
                            ) <= 20
                              ? 'Moderado'
                              : 'Alto'}
                      </Text>

                    </View>

                  </View>

                )
              )

            )}


            <View style={styles.bottomSpace} />

          </>

        )}

      </ScrollView>


      <Navigate navigation={navigation} />

    </View>

  );

}


// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8F9F6',
  },

  content: {
    padding: 20,
    paddingBottom: 20,
  },


  // Header

  header: {
    marginTop: 20,
    marginBottom: 25,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#2F3A3A',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#718080',
  },


  // Sections

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F3A3A',
    marginBottom: 12,
  },


  // Loading

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#718080',
  },


  // Summary

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  summaryCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F8A7A',
  },

  summaryLabel: {
    fontSize: 10,
    color: '#718080',
    marginTop: 5,
    textAlign: 'center',
  },


  // Chart

  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  period: {
    fontSize: 12,
    color: '#718080',
    marginBottom: 12,
  },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  chartArea: {
    height: 140,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },

  chartColumn: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  bar: {
    width: 22,
    borderRadius: 8,
    backgroundColor: '#4F8A7A',
    marginBottom: 8,
  },

  day: {
    fontSize: 11,
    color: '#8B9997',
  },


  // Status

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 25,

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  statusCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,

    backgroundColor: '#DCEFE8',

    justifyContent: 'center',
    alignItems: 'center',
  },

  statusIcon: {
    fontSize: 21,
    color: '#4F8A7A',
  },

  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F3A3A',
  },

  statusDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: '#718080',
    marginTop: 3,
  },


  // Meals

  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 12,

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
    fontSize: 14,
    fontWeight: '600',
    color: '#2F3A3A',
  },

  mealDate: {
    fontSize: 11,
    color: '#8B9997',
    marginTop: 4,
  },

  score: {
    alignItems: 'center',
  },

  scoreNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4F8A7A',
  },

  scoreLabel: {
    fontSize: 9,
    color: '#67A77F',
    marginTop: 2,
  },


  // Empty

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F3A3A',
  },

  emptyDescription: {
    fontSize: 12,
    color: '#8B9997',
    marginTop: 5,
  },


  bottomSpace: {
    height: 10,
  },

});