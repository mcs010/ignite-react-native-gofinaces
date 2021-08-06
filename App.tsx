import React from 'react';
import AppLoading from 'expo-app-loading';
import { ThemeProvider } from 'styled-components';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';
//If no file is specified, automatically renders the index file (only if it's named index, otherwise it will cause an error)
import { Register } from './src/screens/Register';


export default function App() {

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  //While the fonts are being loaded, displays the splash screen
  if(!fontsLoaded){
    return <AppLoading />
  }

  return (
    //ThemeProvider Makes the theme available for all the application
    <ThemeProvider theme={theme}>
      <Register />
    </ThemeProvider>
  )
}