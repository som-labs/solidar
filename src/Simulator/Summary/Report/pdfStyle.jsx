const style = {
  page: {
    backgroundColor: 'white',
    display: 'grid',
    padding: '20px',
    gridTemplateColumns: 'repeat(3,1fr)',
    gridGap: 10,
    fontSize: 14,
    maxWidth: 3508,
    margin: '0 auto',
  },
  title: {
    margin: '8px 0',
  },
  heading: {
    backgroundColor: '#beaf17',
    margin: 0,
    padding: 10,
  },
  h1: {
    textAlign: 'right',
    textTransform: 'uppercase',
    margin: 0,
  },
  strong: {
    color: '#beaf17',
  },
  header: {
    gridColumn: '1/4',
    padding: 10,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 10,
  },
  listpowers: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  },
  warning: {
    gridColumn: '1/4',
    backgroundColor: '#f9cb9c',
    padding: 10,
  },
  warningText: {
    margin: 0,
  },
  dades: {
    backgroundColor: '#beaf17',
    padding: 10,
  },
  coberta: {
    gridColumn: '2/3',
    backgroundColor: '#3f2c20',
    color: 'white',
    padding: 10,
  },
  us: {
    gridColumn: '1/3',
    backgroundColor: '#d9d9d9',
    padding: 10,
  },
  image: {
    gridColumn: '3/4',
    gridRow: '3/5',
  },
  plaques: {
    gridColumn: '1/2',
    textAlign: 'center',
  },
  installacio: {
    gridColumn: '2/4',
    backgroundColor: '#d9d9d9',
    padding: 10,
  },
  estudi: {
    gridColumn: '1/4',
  },
  properespases: {
    gridColumn: '1/4',
  },
  properespasesContainer: {
    border: '1px solid #d9d9d9',
  },
  properespasesText: {
    padding: 10,
    margin: 0,
  },
  properespasesAmbImage: {
    padding: '10px 90px 10px 10px',
    margin: 0,
  },
  primerpas: {
    backgroundColor: '#3f2c20',
    color: 'white',
    fontWeight: 'normal',
    fontSize: 18,
    padding: 10,
    margin: 0,
    position: 'relative',
  },
  primerpasImage: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: 190,
  },
  primerpasBold: {
    color: '#b9db42',
    fontWeight: 'bold',
  },
  segonpas: {
    backgroundColor: '#d9d9d9',
    padding: 10,
    fontSize: 18,
    fontWeight: 'normal',
    margin: 0,
  },

  segonpasBold: {
    fontWeight: 'bold',
  },
  autogeneracio: {
    gridColumn: '1/4',
  },
  autogeneracioTitle: {
    backgroundColor: '#d9d9d9',
    padding: 10,
    fontSize: 18,
    fontWeight: 'normal',
  },
  autogeneracioBold: {
    fontWeight: 'bold',
    color: '#b9db42',
  },
  calculs: {
    gridColumn: '1/4',
  },
  calculsContainer: {
    position: 'relative',
  },
  calculsImage: {
    position: 'absolute',
    right: 0,
    height: 50,
  },
  calculsPrimera: {
    backgroundColor: '#d9d9d9',
    margin: '0 0 10px 0',
    padding: 10,
    height: 120,
  },
  calculsSegona: {
    backgroundColor: '#f9cb9c',
    margin: 0,
    padding: 10,
    minHeight: 140,
  },
  calculsTitle: {
    backgroundColor: '#b3b0b0',
    padding: 10,
    fontSize: 18,
    fontWeight: 'normal',
    margin: 0,
  },
  peu: {
    gridColumn: '1/4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  peuText: {
    padding: 10,
    backgroundColor: '#b9db42',
    margin: 0,
    width: '100%',
  },
  listContainer: {
    padding: 16,
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  listitem: {
    marginBottom: 8,
  },
  table: {
    borderCollapse: 'collapse',
    height: 200,
    width: '50%',
  },
  tableHeading: {
    backgroundColor: '#3f2c20',
    color: 'white',
    padding: 10,
    border: '1px solid #ccc',
  },
  tableCell: {
    padding: 10,
    border: '1px solid #ccc',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  container: {
    display: 'flex',
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
  },
  graphicContainer: {
    gridColumn: '1/4',
    width: '100%',
    height: 400,
    paddingBottom: 120,
    marginBottom: 120,
  },
  piesContainer: {
    display: 'flex',
    width: '25%',
  },
  graphicConsumContainer: {
    gridColumn: '1/4',
    height: 400,
    paddingBottom: 50,
  },
}

export default style
