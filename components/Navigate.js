import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

import { useRoute } from '@react-navigation/native';

export default function Navigate({ navigation }) {

  const route = useRoute();

  const telaAtual = route.name;

  return (
    <View style={styles.container}>

      {/* Perfil */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('TelaUsuario')}
      >

        <View
          style={[
            styles.iconContainer,
            telaAtual === 'TelaUsuario' && styles.iconContainerActive,
          ]}
        >
          <Text
            style={[
              styles.navIcon,
              telaAtual === 'TelaUsuario' && styles.navIconActive,
            ]}
          >
            ◯
          </Text>
        </View>

        <Text
          style={[
            styles.navText,
            telaAtual === 'TelaUsuario' && styles.navTextActive,
          ]}
        >
          Perfil
        </Text>

      </TouchableOpacity>


      {/* Início */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('TelaHome')}
      >

        <View
          style={[
            styles.homeButton,
            telaAtual === 'TelaHome' && styles.homeButtonActive,
          ]}
        >
          <Text
            style={[
              styles.homeIcon,
              telaAtual === 'TelaHome' && styles.homeIconActive,
            ]}
          >
            ⌂
          </Text>
        </View>

        <Text
          style={[
            styles.navText,
            telaAtual === 'TelaHome' && styles.navTextActive,
          ]}
        >
          Início
        </Text>

      </TouchableOpacity>


      {/* Personalizar */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('TelaPersonaliza')}
      >

        <View
          style={[
            styles.iconContainer,
            telaAtual === 'TelaPersonaliza' && styles.iconContainerActive,
          ]}
        >
          <Text
            style={[
              styles.navIcon,
              telaAtual === 'TelaPersonaliza' && styles.navIconActive,
            ]}
          >
            +
          </Text>
        </View>

        <Text
          style={[
            styles.navText,
            telaAtual === 'TelaPersonaliza' && styles.navTextActive,
          ]}
        >
          Personalizar
        </Text>

      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    height: 100,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF1EF',

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },


  navItem: {
    marginVertical: 10,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },


  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,

    justifyContent: 'center',
    alignItems: 'center',
  },


  iconContainerActive: {
    backgroundColor: '#DCEFE8',
  },


  navIcon: {
    fontSize: 21,
    color: '#8B9997',
  },


  navIconActive: {
    color: '#4F8A7A',
  },


  navText: {
    fontSize: 10,
    color: '#8B9997',
    marginTop: 3,
  },


  navTextActive: {
    color: '#4F8A7A',
    fontWeight: '600',
  },


  homeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,

    backgroundColor: '#F1F5F2',

    justifyContent: 'center',
    alignItems: 'center',
  },


  homeButtonActive: {
    backgroundColor: '#DCEFE8',
  },


  homeIcon: {
    fontSize: 20,
    color: '#8B9997',
  },


  homeIconActive: {
    color: '#4F8A7A',
  },

});