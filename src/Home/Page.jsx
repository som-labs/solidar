import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'

//Solidar assets
import houseImage from '../assets/house.png'
import apartmentImage from '../assets/apartment.png'

import HouseIcon from '@mui/icons-material/House'
import ApartmentIcon from '@mui/icons-material/Apartment'
import AppFrame from '../components/AppFrame'
import ToolSelector from './ToolSelector'
import ArticleThumb from './ArticleThumb'
import articles from '../data/articles.yaml'
import { Header, BrochureP as P } from '../components/StyledHtml'

export default function Page() {
  const { t } = useTranslation()

  return (
    <AppFrame>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexFlow: 'row wrap-reverse',
            justifyContent: 'center',
            mt: '2rem',
          }}
        >
          <Box
            style={{
              display: 'inline',
              minWidth: '40%',
              alignSelf: 'stretch',
            }}
            sx={{
              maxWidth: { md: '65%' },
            }}
          >
            <Container
              style={{
                display: 'flex',
                flexFlow: 'column',
                gap: '2rem',
                contentJustify: 'center',
              }}
            >
              <Header>
                {t('HOME.IS_IT_WORTH_TITLE1')}
                <br />
                {t('HOME.IS_IT_WORTH_TITLE2')}
              </Header>
              <P>{t('HOME.IS_IT_WORTH_PARAGRAPH1')}</P>
              <P>{t('HOME.IS_IT_WORTH_PARAGRAPH2')}</P>
              <Box>
                <Button variant="contained" href="#tools">
                  {t('HOME.IS_IT_WORTH_BUTTON')}
                </Button>
              </Box>
            </Container>
          </Box>
          <img
            src="/logo.svg"
            style={{
              objectFit: 'contain',
              maxWidth: '30%',
              minWidth: 'min(90%, 300px)',
            }}
          />
        </Box>
        <Box
          sx={{ display: 'flex', flexFlow: 'column', my: '2rem' }}
          style={{ alignItems: 'center' }}
        >
          <Header>
            <a name="tools" />
            {t('HOME.SIMULATION_TOOLS_TITLE')}
          </Header>
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
              icon={HouseIcon}
              image={houseImage}
              route="/simulator"
              title={t('HOME.SIMULATION_TOOLS_INDIVIDUAL')}
              subtitle={t('HOME.SIMULATION_TOOLS_INDIVIDUAL_DESCRIPTION')}
            ></ToolSelector>
            <ToolSelector
              icon={ApartmentIcon}
              image={apartmentImage}
              title={t('HOME.SIMULATION_TOOLS_COLLECTIVE')}
              subtitle={t('HOME.SIMULATION_TOOLS_COLLECTIVE_DESCRIPTION')}
            />
          </Box>
        </Box>
        <Box>
          <Container
            sx={{ display: 'flex', flexFlow: 'column', mt: '2rem', alignItems: 'center' }}
          >
            <Header>{t('HOME.FURTHER_INFORMATION_TITLE')}</Header>
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
    </AppFrame>
  )
}
