import { createTheme, responsiveFontSizes } from '@mui/material/styles'

export default function SomEnergiaTheme(isDarkMode) {
  return responsiveFontSizes(
    createTheme({
      typography: {
        fontFamily: '"Outfit","Roboto","Montserrat", "Helvetica", "Arial", sans-serif',
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

        background: {
          default: isDarkMode ? '#000000' : '#FFFFFF',
          paper: isDarkMode ? '#000000' : '#FFFFFF',
        },
        // background: {
        //   default: alpha('#1976d2', 0.1),
        //   paper: '#ffffff',
        // },

        text: {
          primary: isDarkMode ? '#FFFFFF' : '#000000',
        },

        primary: {
          main: isDarkMode ? '#F0F3EC' : '#0B2E34',
          contrastText: isDarkMode ? '#0B2E34' : '#000000',
        },

        secondary: {
          main: '#F0F3EC',
          contrastText: '#000000',
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
      components: {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: '20px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D9D9D9',
              },
              // Hover state
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'blue',
              },
              // Focused state
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#007AFF',
              },
              // Disabled state
              '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                borderColor: 'lightgray',
              },
              // Error state
              '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: 'red',
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              // Default state
              borderRadius: '20px',
              backgroundColor: '#CDFF80',
              color: '#000000',
              textTransform: 'none',
              transition: 'background-color 0.3s ease',

              // Hover state
              '&:hover': {
                backgroundColor: '#B6E471',
              },

              // Active (pressed) state
              '&.Mui-active': {
                backgroundColor: '#004080',
              },

              // Disabled (inactive) state
              '&.Mui-disabled': {
                backgroundColor: '##F0F3EC',
                color: '#a1a1a1',
              },
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              textAlign: 'left',
              padding: '8px',
              border: '1px solid black',
              backgroundColor: 'rgba(205,255,128,0.9)',
              color: 'black',
              borderRadius: '10px',
              fontFamily: 'inherit',
              fontSize: 'inherit',
            },
          },
        },
      },
    }),
  )
}
