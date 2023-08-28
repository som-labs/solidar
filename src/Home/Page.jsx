import React from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ToolSelector from './ToolSelector'
import ArticleThumb from './ArticleThumb'
import articles from '../data/articles.yaml'

export default function Page() {
  const { t, i18n } = useTranslation()
  return (
    <Container>
      <Box sx={{ display: 'flex', flexFlow: 'row', mt: '2rem' }}>
        <Box>
          <Container>
            <h1 sx={{}}>
              {t('HOME.IS_IT_WORTH_TITLE1')}
              <br />
              {t('HOME.IS_IT_WORTH_TITLE2')}
              <br />
            </h1>
            <p>{t('HOME.IS_IT_WORTH_PARAGRAPH1')}</p>
            <p>{t('HOME.IS_IT_WORTH_PARAGRAPH2')}</p>
            <Button variant="contained" href="#tools">
              {t('HOME.IS_IT_WORTH_BUTTON')}
            </Button>
          </Container>
        </Box>
        <img
          src="/logo.svg"
          style={{ objectFit: 'contain', minWidth: '100px', width: '50%' }}
        />
      </Box>
      <Box
        sx={{ display: 'flex', flexFlow: 'column', my: '2rem' }}
        style={{ alignItems: 'center' }}
      >
        <h1>
          <a name="tools" />
          {t('HOME.SIMULATION_TOOLS_TITLE')}
        </h1>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexFlow: 'row wrap',
            justifyContent: 'center',
            gap: '5%',
          }}
        >
          <ToolSelector
            route="/simulator"
            title={t('HOME.SIMULATION_TOOLS_INDIVIDUAL')}
            subtitle={t('HOME.SIMULATION_TOOLS_INDIVIDUAL_DESCRIPTION')}
          />
          <ToolSelector
            title={t('HOME.SIMULATION_TOOLS_COLLECTIVE')}
            subtitle={t('HOME.SIMULATION_TOOLS_COLLECTIVE_DESCRIPTION')}
          />
        </Box>
      </Box>
      <Box>
        <Container
          sx={{ display: 'flex', flexFlow: 'column', mt: '2rem', alignItems: 'center' }}
        >
          <h1 sx={{}}>{t('HOME.FURTHER_INFORMATION_TITLE')}</h1>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexFlow: 'row wrap',
              justifyContent: 'center',
            }}
          >
            {articles.map((article, i) => (
              <ArticleThumb key={i} {...article} />
            ))}
          </Box>
        </Container>
      </Box>
    </Container>
  )
}
