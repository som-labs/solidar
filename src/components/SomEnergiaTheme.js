import { createTheme, responsiveFontSizes } from '@mui/material/styles'

export default function SomEnergiaTheme(isDarkMode) {
  return responsiveFontSizes(
    createTheme({
      typography: {
        fontFamily: '"Roboto","Montserrat", "Helvetica", "Arial", sans-serif',
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
        databox: {
          main: isDarkMode ? '#333333' : 'grey',
          contrastText: isDarkMode ? 'white' : 'white',
        },
        helpIcon: {
          main: '#810C04',
        },
        infoIcon: {
          main: '#AFBE3F',
        },
        dataBox: {
          main: '#d9d9d9',
        },

        infoBox: {
          // main: isDarkMode ? '#F8F8FF' : '#FFF0F5',
          bgcolor: isDarkMode ? '#333333' : '#F8F8F8',
          //border: isDarkMode ? '1px solid white' : '1px solid #96b633',
          contrastText: 'black',
          display: 'flex',
          flexWrap: 'wrap',
          flex: 1,
          borderRadius: 0,
          justifyContent: 'center',
        },

        circulo: {
          main: isDarkMode ? '#e6cc00' : '#000',
          text: isDarkMode ? 'white' : 'white',
        },

        balance: {
          produccion: isDarkMode ? '#AFBE3F' : '#AFBE3F',
          consumo: isDarkMode ? '#446BC1' : '#446BC1',
          consumoDiurno: '#C68C43',
          consumoNocturno: '#222D4C',
          autoconsumo: isDarkMode ? '#C7A6CF' : '#C7A6CF',
          deficit: isDarkMode ? '#4D4D4D' : '#4D4D4D',
          excedente: isDarkMode ? '#997171' : '#997171',
        },
      },
      informe: {
        warning: {
          backgroundColor: isDarkMode ? '#333333' : '#f9cb9c',
          padding: 10,
        },
        dataBox: {
          title: {
            backgroundColor: isDarkMode ? '#333333' : 'grey',
            text: isDarkMode ? 'white' : 'white',
          },
          data: {
            backgroundColor: isDarkMode ? 'grey' : 'white',
            text: isDarkMode ? 'white' : 'white',
          },
        },
        sectionBox: {
          title: {
            backgroundColor: isDarkMode ? '#666666' : '#96b633',
            text: isDarkMode ? 'white' : 'white',
          },
          data: {
            backgroundColor: isDarkMode ? 'grey' : 'white',
            text: isDarkMode ? 'white' : 'white',
          },
        },
        energyTable: {
          title: {
            backgroundColor: isDarkMode ? '#666666' : 'grey',
          },
        },

        titleBox: {
          display: 'flex',
          flexDirection: 'column',
          flex: '1',
          backgroundColor: isDarkMode ? '#666666' : '#beaf17',
          padding: 1,
          gap: 1,
        },
      },
      titles: {
        level_0: {
          fontSize: '2.5rem',
          fontWeight: 700,
        },
        level_1: {
          fontSize: '1.7rem',
          fontWeight: 700,
        },
        level_2: {
          fontSize: '1.5rem',
          fontWeight: 500,
        },
        collapsible: {
          fontSize: '1.7rem',
          fontWeight: 700,
        },
      },

      //       fontWeight: 400,
      // borderRadius: "var(--none, 0px)",
      // borderBottom: "1px solid var(--divider, rgba(0, 0, 0, 0.12))",
      // borderLeft: "var(--none, 0px) solid var(--divider, rgba(0, 0, 0, 0.12))",
      // borderRight: "var(--none, 0px) solid var(--divider, rgba(0, 0, 0, 0.12))",
      // borderTop: "var(--none, 0px) solid var(--divider, rgba(0, 0, 0, 0.12))",
      // background: "var(--primary-selected, rgba(33, 150, 243, 0.08))",
      // alignItems: 'space-between !important'
      //REVISAR: como hacer la justificacion del texto del header aqui
      tables: {
        headerWrap: {
          '& .MuiDataGrid-columnHeaderTitle': {
            whiteSpace: 'normal',
            lineHeight: 'normal',
            //color: 'green',
            alignItems: 'center !important',
          },
          '& .MuiDataGrid-columnHeader': {
            // Forced to use important since overriding inline styles
            height: 'unset !important',
          },
          '& .MuiDataGrid-columnHeaders': {
            // Forced to use important since overriding inline styles
            maxHeight: '168px !important',

            //alignItems: 'center',
            //textAlign: 'center',
            //align: 'center',
            //headerAlign: 'center',
          },

          // Remove external border
          '& .MuiDataGrid-columnsContainer': {
            border: 'none',
            borderBottom: 'none', // Remove border at the bottom of the header row
          },
        },
      },
    }),
  )
}
