import React from 'react'
import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import TextField from '@mui/material/TextField'
import DateEditor from "react-tabulator/lib/editors/DateEditor";
import MultiValueFormatter from "react-tabulator/lib/formatters/MultiValueFormatter";
import MultiSelectEditor from "react-tabulator/lib/editors/MultiSelectEditor";
import Button from '@mui/material/Button'

const SummaryStep = () => {
    const { t, i18n } = useTranslation()

    return <>
        <Container>
            <Typography variant='h3'>{t("SIMULATOR.TITLE_SUMMARY")}</Typography>
            <Typography variant='body'>{t("SIMULATOR.DESC_SUMMARY")}</Typography>
        </Container>
    </>
}

export default SummaryStep
