import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const fatosFodmap = [
  'A criação da tabela FODMAP foi desenvolvida em 2005 por pesquisadores da Monash University, na Austrália.',

  'Alguns tipos de FODMAPs são frutanos, galactanas, lactose, frutose e polióis.',

  'FODMAP é uma sigla para um grupo de carboidratos de cadeia curta que podem ser mal absorvidos pelo intestino.',

  'A tolerância aos FODMAPs pode variar de uma pessoa para outra. Por isso, verifique a aba "Personalizar"',

  'O tamanho da porção pode influenciar a quantidade de FODMAP consumida.',

  'Frutanos são encontrados em alimentos como alho, cebola e alguns cereais.',

  'A lactose é um tipo de FODMAP encontrado principalmente no leite e em seus derivados.',

  'O alho e a cebola são alimentos ricos em frutanos.',

  'Algumas frutas possuem frutose e polióis em quantidades que podem causar sintomas em pessoas sensíveis.'
];

export default function TelaInit({ navigation }) {

  const [fato] = useState(() => {
    const indice = Math.floor(
      Math.random() * fatosFodmap.length
    );

    return fatosFodmap[indice];
  });

  useEffect(() => {

    const timer = setTimeout(() => {
      navigation.replace('TelaHome');
    }, 2000);

    return () => clearTimeout(timer);

  }, [navigation]);

  return (
    <View style={styles.container}>

      <View style={styles.logo}>

        <Image
          source={require('../assets/splash.png')}
          style={styles.logoImage}
        />

      </View>

      <Text style={styles.title}>
        SII Me
      </Text>

      <Text style={styles.subtitle}>
        {fato}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8F9F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#4F8A7A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2F3A3A',
  },

  subtitle: {
    marginTop: 10,
    paddingHorizontal: 35,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: '#718080',
  },

});