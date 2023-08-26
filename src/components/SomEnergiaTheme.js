import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export default function SomEnergiaTheme(isDarkMode) {
  return responsiveFontSizes(createTheme({
    typography: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    },
    palette: {
      mode: (isDarkMode?'dark':'light'),
      primary: {
        main: '#96D600', //'hsl(78, 100%, 42%)',
      },
      secondary: {
        main: '#E0E723', //'hsl(62, 80%, 52%)',
      },
    },
  }))
}
