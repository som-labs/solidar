import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { DataGrid } from '@mui/x-data-grid'
import * as UTIL from '../../Utiles'
import TCBContext from '../../TCBContext'
import TCB from '../../classes/TCB.js'

const SummaryStep = () => {
    const { t, i18n } = useTranslation()
    const {bases, setBases, tipoConsumo, setTipoConsumo} = useContext(TCBContext)

    function deleteBase( index) {
        let oldBases = [...bases]
        let nIndex = oldBases.findIndex( t => t.idBaseSolar == index )
        oldBases.splice(nIndex, 1)
        TCB.BaseSolar.splice(nIndex, 1)
        setBases(oldBases)
    }

    const columns = [
       // { field: 'idBaseSolar', headerName: 'ID', width: 50 },
        { field: 'nombreBaseSolar', headerName: 'Nombre' },
        { field: 'areaReal', headerName: 'Area real', width: 130, align:'right', renderCell: (params) => {
            return UTIL.formatoValor('areaReal', params.value)}},
        { field: 'inclinacionTejado', headerName: 'Inclinación', align:'right'},
        { field: 'inAcimut', headerName: 'Acimut', align:'right'},
        { field: 'potenciaMaxima', headerName: 'Pot. Maxima', align:'right', renderCell: (params) => {
            return UTIL.formatoValor('potenciaMaxima',params.value)}}
    ]

    function getRowId(row) {
        return row.idBaseSolar;
    }

    return <>
        <Container>
            <Typography variant='h3'>{t("LOCATION.LABEL_SUMMARY")}</Typography>
            <Typography variant='body'>{t("LOCATION.PROMPT_SUMMARY")}</Typography>
            
            <DataGrid
                getRowId={getRowId}
                rows={bases}
                columns={columns}
                initialState={{
                  pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10]}
                //checkboxSelection
            />
        </Container>
    </>
}

export default SummaryStep;