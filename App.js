import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TelaInit from './telas/TelaInit';
import TelaHome from './telas/TelaHome';
import TelaUsuario from './telas/TelaUsuario';
import TelaPersonaliza from './telas/TelaPersonaliza';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>

      <Stack.Navigator
        initialRouteName="TelaInit"
        screenOptions={{
          headerShown: false,
        }}
      >

        <Stack.Screen
          name="TelaInit"
          component={TelaInit}
        />

        <Stack.Screen
          name="TelaHome"
          component={TelaHome}
        />

        <Stack.Screen
          name="TelaUsuario"
          component={TelaUsuario}
        />

        <Stack.Screen
          name="TelaPersonaliza"
          component={TelaPersonaliza}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}