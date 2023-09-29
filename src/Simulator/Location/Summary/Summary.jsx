import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { DataGrid } from '@mui/x-data-grid'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Delete'

import BasesContext from '../../BasesContext'
import TCB from '../../classes/TCB.js'
import BaseSolar from '../../classes/BaseSolar.js'

const SummaryStep = () => {
    const { t, i18n } = useTranslation()
    const {bases, setBases} = useContext(BasesContext)

    function deleteBase( index) {
        let oldBases = [...bases]
        let nIndex = oldBases.findIndex( t => t.idBaseSolar == index )
        oldBases.splice(nIndex, 1)
        TCB.BaseSolar.splice(nIndex, 1)
        setBases(oldBases)
    }

    const columns = [
        { field: 'idBaseSolar', headerName: 'ID', width: 70 },
        { field: 'nombreBaseSolar', headerName: 'Nombre', width: 130 },
        { field: 'areaReal', headerName: 'Area real', width: 130 },
        { field: 'inclinacionTejado', headerName: 'Inclinación'},
        { field: 'inAcimut', headerName: 'Acimut'}
    ]

    function getRowId(row) {
        return row.idBaseSolar;
    }

    return <>
        <Container>
            <Typography variant='h3'>{t("SIMULATOR.LABEL_SUMMARY")}</Typography>
            <Typography variant='body'>{t("SIMULATOR.PROMPT_SUMMARY")}</Typography>
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
                checkboxSelection
            />
        </Container>
    </>
}

export default SummaryStep;