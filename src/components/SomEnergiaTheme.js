import { createTheme, responsiveFontSizes } from '@mui/material/styles'

export default function SomEnergiaTheme(isDarkMode) {
  return responsiveFontSizes(
    createTheme({
      typography: {
        fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
        // Custom variant for home page paragraphs
        brochureP: {
          fontSize: 18,
        },
      },
      palette: {
        mode: isDarkMode ? 'dark' : 'light',
        //contrastThreshold: 0.2, // From webforms-ui
        contrastThreshold: 4.5, // Recommended by WCAG 2.1 Rule 1.4.3
        tonalOffset: 0.2,
        text: {
          primary: isDarkMode ? '#bdbdbd' : '#4d4d4d',
        },
        primary: {
          //main: '#96D600', //'hsl(78, 100%, 42%)', // from style guide
          main: '#96b633', // from webforms-ui
          contrastText: 'white',
        },
        secondary: {
          //main: '#E0E723', //'hsl(62, 80%, 52%)', // from style guide
          //main: '#a1a1a1', // from webforms-ui
          main: '#e6cc00', // From representa-ov highlight
          contrastText: 'white',
        },

        //PENDIENTE: decidir colores de infobox
        infoBox: {
          // main: isDarkMode ? '#F8F8FF' : '#FFF0F5',
          main: isDarkMode ? '#333333' : '#F8F8F8',
          contrastText: 'black',
        },

        circulo: {
          main: isDarkMode ? '#e6cc00' : '#000',
          contrastText: 'white',
        },

        balance: {
          produccion: isDarkMode ? '#59A14F' : '#59A14F',
          consumo: isDarkMode ? '#B6722F' : '#B6722F',
          autoconsumo: isDarkMode ? '#86AC41' : '#B3C100',
          deficit: isDarkMode ? '#F4CC70' : '#F4CC70',
          excedente: isDarkMode ? '#E15759' : '#E15759',
        },
      },
    }),
  )
}
