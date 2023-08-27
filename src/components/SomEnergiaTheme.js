import { createTheme, responsiveFontSizes } from '@mui/material/styles'

export default function SomEnergiaTheme(isDarkMode) {
  return responsiveFontSizes(createTheme({
    typography: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    },
    palette: {
      mode: (isDarkMode?'dark':'light'),
      //contrastThreshold: 0.2, // From webforms-ui
      contrastThreshold: 4.5, // Recommended by WCAG 2.1 Rule 1.4.3
      tonalOffset: 0.5,
      text: {
        primary: (isDarkMode? '#bdbdbd':'#4d4d4d')
      },
      primary: {
        main: '#96b633', // from webforms-ui
        //main: '#96D600', //'hsl(78, 100%, 42%)', // from style guide
        contrastText: 'white',
      },
      secondary: {
        main: '#a1a1a1', // from webforms-ui
        //main: '#E0E723', //'hsl(62, 80%, 52%)', // from style guide
      },
    },
  }))
}
