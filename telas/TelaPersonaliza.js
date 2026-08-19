import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';

import Navigate from '../components/Navigate';

import {
  buscarModificador,
  salvarModificador as salvarModificadorDB,
} from '../database/alimentosPersonalizados';

import {
  listarAlimentos,
  buscarAlimentos,
} from '../database/alimentos';

import {
  resetDatabase,
} from '../database/database';

export default function TelaPersonaliza({ navigation }) {

  // -----------------------------
  // Estados
  // -----------------------------

  const [alimentos, setAlimentos] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [modalVisivel, setModalVisivel] = useState(false);

  const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);

  const [modificador, setModificador] = useState(0);


  // -----------------------------
  // Carregar alimentos
  // -----------------------------

  useEffect(() => {
    carregarAlimentos();
  }, []);


  async function carregarAlimentos() {

    try {

      setCarregando(true);

      const resultado = await listarAlimentos();

      setAlimentos(resultado);

    } catch (error) {

      console.error(
        'Erro ao carregar alimentos:',
        error
      );

    } finally {

      setCarregando(false);

    }
  }
  // -----------------------------
  // Reset database
  // -----------------------------

  async function resetarBanco() {

  try {

    setCarregando(true);

    await resetDatabase();

    console.log('Database resetada.');

    // Recarrega os alimentos
    await carregarAlimentos();

  } catch (error) {

    console.error(
      'Erro ao resetar database:',
      error
    );

  } finally {

    setCarregando(false);

  }
}

  // -----------------------------
  // Pesquisa
  // -----------------------------

  async function pesquisar(texto) {

    setPesquisa(texto);

    if (!texto.trim()) {

      carregarAlimentos();

      return;
    }

    try {

      const resultado = await buscarAlimentos(texto);

      setAlimentos(resultado);

    } catch (error) {

      console.error(
        'Erro ao pesquisar alimentos:',
        error
      );

    }
  }


  // -----------------------------
  // Modal
  // -----------------------------

async function abrirModificador(alimento = null) {

  setAlimentoSelecionado(alimento);

  if (!alimento) {

    setModificador(0);

    setModalVisivel(true);

    return;
  }

  try {

    const personalizacao =
      await buscarModificador(alimento.id);

    if (personalizacao) {

      setModificador(
        personalizacao.modificador
      );

    } else {

      setModificador(0);

    }

    setModalVisivel(true);

  } catch (error) {

    console.error(
      'Erro ao carregar modificador:',
      error
    );

  }
}


  function fecharModal() {

    setModalVisivel(false);

    setAlimentoSelecionado(null);

    setModificador(0);
  }


  // -----------------------------
  // Modificador
  // -----------------------------

  function alterarModificador(valor) {

    const novoValor = modificador + valor;

    if (novoValor < -10 || novoValor > 10) {
      return;
    }

    setModificador(novoValor);
  }


  // -----------------------------
  // Salvar
  // -----------------------------

async function salvarModificador() {

  if (!alimentoSelecionado) {
    return;
  }

  try {

    await salvarModificadorDB(
      alimentoSelecionado.id,
      modificador
    );

    console.log(
      'Modificador salvo:',
      alimentoSelecionado.nome,
      modificador
    );

    // Atualiza a lista imediatamente
    const listaAtualizada =
      pesquisa.trim()
        ? await buscarAlimentos(pesquisa)
        : await listarAlimentos();

    setAlimentos(listaAtualizada);

    fecharModal();

  } catch (error) {

    console.error(
      'Erro ao salvar modificador:',
      error
    );

  }
}

  // -----------------------------
  // Interface
  // -----------------------------

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =========================
            CABEÇALHO
        ========================== */}

        <View style={styles.header}>

          <Text style={styles.title}>
            Personalizar
          </Text>

          <Text style={styles.subtitle}>
            Ajuste o SII-Me às suas necessidades
          </Text>

        </View>


        {/* =========================
            MODIFICADOR
        ========================== */}

        <Text style={styles.sectionTitle}>
          Sensibilidade pessoal
        </Text>


        <TouchableOpacity
          style={styles.infoCard}
          onPress={() => abrirModificador()}
          activeOpacity={0.7}
        >

          <View style={styles.infoHeader}>

            <View style={styles.infoIcon}>

              <Text style={styles.infoIconText}>
                ⚙
              </Text>

            </View>


            <View style={styles.infoText}>

              <Text style={styles.cardTitle}>
                Modificador de agressividade
              </Text>

              <Text style={styles.cardDescription}>
                Ajuste o peso dos alimentos de acordo
                com a sua sensibilidade pessoal.
              </Text>

            </View>


            <Text style={styles.arrow}>
              ›
            </Text>

          </View>

        </TouchableOpacity>


        {/* =========================
            PESQUISA
        ========================== */}

        <Text style={styles.sectionTitle}>
          Alimentos
        </Text>


        <View style={styles.searchContainer}>

          <Text style={styles.searchIcon}>
            ⌕
          </Text>


          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar alimento..."
            placeholderTextColor="#8B9997"
            value={pesquisa}
            onChangeText={pesquisar}
          />

        </View>


        {/* =========================
            LISTA DE ALIMENTOS
        ========================== */}

        {carregando ? (

          <Text style={styles.loading}>
            Carregando alimentos...
          </Text>

        ) : alimentos.length === 0 ? (

          <View style={styles.emptyCard}>

            <Text style={styles.emptyTitle}>
              Nenhum alimento encontrado
            </Text>

            <Text style={styles.emptyDescription}>
              Tente pesquisar por outro nome.
            </Text>

          </View>

        ) : (

          alimentos.map((alimento) => (

            <TouchableOpacity
                key={alimento.id}
                style={styles.foodCard}
                onPress={() => abrirModificador(alimento)}
                activeOpacity={0.7}
                >

                <View style={styles.foodIcon}>

                    <Text>
                    🍽️
                    </Text>

                </View>


                <View style={styles.foodInfo}>

                    <Text style={styles.foodName}>
                    {alimento.nome}
                    </Text>

                    <Text style={styles.foodCategory}>
                    {alimento.categoria}
                    </Text>

                    <Text style={styles.foodPortion}>
                    Porção: {alimento.porcao}g
                    </Text>

                </View>


                <View style={styles.scoreContainer}>

                    <Text style={styles.score}>
                    {alimento.score_pessoal}
                    </Text>

                    <Text style={styles.scoreLabel}>
                    SEU SCORE
                    </Text>

                </View>

                </TouchableOpacity>

          ))

        )}

      </ScrollView>


      {/* =========================
          MODAL
      ========================== */}

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={fecharModal}
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modal}>

            {/* Cabeçalho do modal */}

            <View style={styles.modalHeader}>

              <View style={styles.modalHeaderText}>

                <Text style={styles.modalTitle}>

                  {alimentoSelecionado
                    ? 'Sensibilidade pessoal'
                    : 'Modificador pessoal'}

                </Text>


                <Text style={styles.modalSubtitle}>

                  {alimentoSelecionado
                    ? alimentoSelecionado.nome + ': ' + (alimentoSelecionado.descricao || '')
                    : 'Ajuste como os alimentos afetam você'}

                </Text>

              </View>


              <TouchableOpacity
                onPress={fecharModal}
                style={styles.closeButton}
              >

                <Text style={styles.closeText}>
                  ×
                </Text>

              </TouchableOpacity>

            </View>


            {/* Fórmula */}

            <View style={styles.formulaCard}>

              <Text style={styles.formulaLabel}>
                Pontuação do alimento
              </Text>


              <View style={styles.formula}>

                <Text style={styles.formulaNumber}>

                  {alimentoSelecionado
                    ? alimentoSelecionado.fodmap_score
                    : 'Valor base'}

                </Text>


                <Text style={styles.formulaOperator}>
                  +
                </Text>


                <Text style={styles.formulaModifier}>

                  {modificador > 0
                    ? `+${modificador}`
                    : modificador}

                </Text>


                <Text style={styles.formulaOperator}>
                  =
                </Text>


                <Text style={styles.formulaResult}>

                  {alimentoSelecionado
                    ? alimentoSelecionado.fodmap_score + modificador
                    : 'Valor ajustado'}

                </Text>

              </View>

            </View>

{/* Modificador */}

<Text style={styles.modifierTitle}>
  Modificador pessoal
</Text>

<Text style={styles.modifierDescription}>
  Ajuste o score de acordo com a sua sensibilidade pessoal.
</Text>


            {/* Controle */}

            <View style={styles.modifierControl}>

              <TouchableOpacity
                style={styles.modifierButton}
                onPress={() => alterarModificador(-1)}
              >

                <Text style={styles.modifierButtonText}>
                  −
                </Text>

              </TouchableOpacity>


              <View style={styles.modifierValueContainer}>

                <Text
                  style={[
                    styles.modifierValue,

                    modificador > 0 &&
                      styles.modifierPositive,

                    modificador < 0 &&
                      styles.modifierNegative,
                  ]}
                >

                  {modificador > 0
                    ? `+${modificador}`
                    : modificador}

                </Text>

              </View>


              <TouchableOpacity
                style={styles.modifierButton}
                onPress={() => alterarModificador(1)}
              >

                <Text style={styles.modifierButtonText}>
                  +
                </Text>

              </TouchableOpacity>

            </View>


            {/* Escala */}

            <View style={styles.scale}>

              <Text style={styles.scaleNegative}>
                -10
              </Text>

              <Text style={styles.scaleNeutral}>
                0
              </Text>

              <Text style={styles.scalePositive}>
                +10
              </Text>

            </View>


            {/* Salvar */}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={salvarModificador}
            >

              <Text style={styles.saveButtonText}>
                Salvar modificador
              </Text>

            </TouchableOpacity>


            {/* Cancelar */}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={fecharModal}
            >

              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>


      {/* =========================
          NAVEGAÇÃO
      ========================== */}

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
    paddingBottom: 25,
  },


  // -----------------------------
  // Cabeçalho
  // -----------------------------

  header: {
    marginTop: 20,
    marginBottom: 25,
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


  // -----------------------------
  // Seções
  // -----------------------------

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F3A3A',
    marginBottom: 12,
  },


  // -----------------------------
  // Card de informação
  // -----------------------------

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },


  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,

    backgroundColor: '#DCEFE8',

    justifyContent: 'center',
    alignItems: 'center',
  },


  foodModifier: {
  fontSize: 10,
  color: '#4F8A7A',
  marginTop: 2,
},


  infoIconText: {
    fontSize: 19,
    color: '#4F8A7A',
  },


  infoText: {
    flex: 1,
    marginLeft: 12,
  },


  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F3A3A',
  },


  cardDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: '#718080',
  },


  arrow: {
    fontSize: 28,
    color: '#8B9997',
  },


  // -----------------------------
  // Pesquisa
  // -----------------------------

  searchContainer: {
    height: 52,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 15,

    marginBottom: 15,

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },


  searchIcon: {
    fontSize: 25,
    color: '#718080',
    marginRight: 8,
  },


  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2F3A3A',
  },


  // -----------------------------
  // Alimentos
  // -----------------------------

  foodCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 10,

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },


  foodIcon: {
    width: 45,
    height: 45,

    borderRadius: 14,

    backgroundColor: '#F1F5F2',

    justifyContent: 'center',
    alignItems: 'center',
  },


  foodInfo: {
    flex: 1,
    marginLeft: 12,
  },


  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F3A3A',
  },


  foodCategory: {
    fontSize: 11,
    color: '#718080',
    marginTop: 3,
  },


  foodPortion: {
    fontSize: 10,
    color: '#8B9997',
    marginTop: 2,
  },


  scoreContainer: {
    alignItems: 'center',
  },


  score: {
    fontSize: 19,
    fontWeight: '700',
    color: '#4F8A7A',
  },


  scoreLabel: {
    fontSize: 9,
    color: '#8B9997',
    marginTop: 2,
  },


  // -----------------------------
  // Loading / vazio
  // -----------------------------

  loading: {
    textAlign: 'center',
    marginTop: 30,
    color: '#718080',
  },


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


  // -----------------------------
  // Modal
  // -----------------------------

  modalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(0, 0, 0, 0.35)',

    justifyContent: 'center',
    alignItems: 'center',

    padding: 20,
  },


  modal: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 22,
  },


  modalHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'flex-start',

    marginBottom: 20,
  },


  modalHeaderText: {
    flex: 1,
  },


  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F3A3A',
  },


  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#718080',
  },


  closeButton: {
    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: '#F1F5F2',

    justifyContent: 'center',
    alignItems: 'center',
  },


  closeText: {
    fontSize: 23,
    color: '#718080',
  },


  // -----------------------------
  // Fórmula
  // -----------------------------

  formulaCard: {
    backgroundColor: '#F8F9F6',

    borderRadius: 10,
    marginHorizontal: -15,
    padding: 16,

    marginBottom: 22,
  },


  formulaLabel: {
    fontSize: 11,

    color: '#8B9997',

    textAlign: 'center',

    marginBottom: 10,
  },


  formula: {
    flexDirection: 'row',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },


  formulaNumber: {
    fontSize: 24,

    fontWeight: '700',

    color: '#4F8A7A',
  },


  formulaOperator: {
    fontSize: 19,

    color: '#8B9997',

    marginHorizontal: 10,
  },


  formulaModifier: {
    fontSize: 24,

    fontWeight: '700',

    color: '#D18B52',
  },


  formulaResult: {
    fontSize: 24,

    fontWeight: '700',

    color: '#2F3A3A',
  },


  // -----------------------------
  // Controle do modificador
  // -----------------------------

  modifierTitle: {
    fontSize: 15,

    fontWeight: '700',

    color: '#2F3A3A',
  },


  modifierDescription: {
    fontSize: 12,

    color: '#718080',

    marginTop: 4,
  },


  modifierControl: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 18,
  },


  modifierButton: {
    width: 48,
    height: 48,

    borderRadius: 14,

    backgroundColor: '#DCEFE8',

    justifyContent: 'center',
    alignItems: 'center',
  },


  modifierButtonText: {
    fontSize: 25,

    color: '#4F8A7A',
  },


  modifierValueContainer: {
    width: 90,

    alignItems: 'center',
  },


  modifierValue: {
    fontSize: 30,

    fontWeight: '700',

    color: '#2F3A3A',
  },


  modifierPositive: {
    color: '#D18B52',
  },


  modifierNegative: {
    color: '#B56B6B',
  },


  // -----------------------------
  // Escala
  // -----------------------------

  scale: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginTop: 8,

    paddingHorizontal: 10,
  },


  scaleNegative: {
    fontSize: 10,

    color: '#B56B6B',
  },


  scaleNeutral: {
    fontSize: 10,

    color: '#8B9997',
  },


  scalePositive: {
    fontSize: 10,

    color: '#D18B52',
  },


  // -----------------------------
  // Botões do modal
  // -----------------------------

  saveButton: {
    height: 50,

    borderRadius: 15,

    backgroundColor: '#4F8A7A',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 22,
  },


  saveButtonText: {
    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '700',
  },


  cancelButton: {
    height: 45,

    justifyContent: 'center',
    alignItems: 'center',
  },


  cancelButtonText: {
    fontSize: 13,

    color: '#718080',
  },
  resetButton: {
  marginTop: 25,
  marginBottom: 20,

  height: 45,

  borderRadius: 14,

  backgroundColor: '#F1E2E2',

  justifyContent: 'center',
  alignItems: 'center',
},

resetButtonText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#B56B6B',
},
});