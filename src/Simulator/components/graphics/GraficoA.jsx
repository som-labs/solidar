import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Plot from 'react-plotly.js'
import TCBContext from '../../TCBContext'

import Container from '@mui/material/Container'

const GraficoA = () => {
    const { t, i18n } = useTranslation()
    const {bases, setBases} = useContext(TCBContext)
    return <>
        <Container>
            <Plot
                data={[
                    {
                        x: bases.map( (t) => t.nombreBaseSolar),
                        y: bases.map( (t) => t.areaReal),
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: {color: 'red'},
                        name: 'Area real'
                    },
                    {
                        x: bases.map( (t) => t.nombreBaseSolar),
                        y: bases.map( (t) => t.areaMapa),
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: {color: 'blue'},
                        name: 'Area mapa'
                    }
                ]}
                layout={ {width: 320, height: 240, title: 'Areas de las bases'} } 
            />
        </Container>
    </>
}

export default GraficoA;
