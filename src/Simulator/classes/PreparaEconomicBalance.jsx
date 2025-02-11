// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

// Solidar objects
import Economico from '../classes/Economico'
import Balance from '../classes/Balance'

export default async function PreparaEconomicBalance() {
  console.log('->PreparaEconomicBalance')
  let cursorOriginal = document.body.style.cursor
  document.body.style.cursor = 'progress'

  console.log(TCB.importando, TCB.economico, !TCB.importando || !TCB.economico)
  //When importing first time will not compute Economico next yes
  if (!TCB.importando || !TCB.economico) {
    TCB.economico = new Economico()
    UTIL.debugLog('calcula economico global ', TCB.economico)
    if (TCB.economico.periodoAmortizacion > 20) {
      alert(TCB.i18next.t('ECONOMIC_BALANCE.WARNING_AMORTIZATION_TIME'))
    }

    console.log('Condiciones recalculo fincas', TCB.modoActivo !== 'INDIVIDUAL')

    if (TCB.modoActivo !== 'INDIVIDUAL') {
      let _consumo
      console.log('Recalculo Zonascomunes')
      //Calcular balance y economico de zonas comunes para asignar ahorro a las fincas despues
      for (const _zc of TCB.ZonaComun) {
        _consumo = TCB.TipoConsumo.find(
          (_tc) => _zc.nombreTipoConsumo === _tc.nombreTipoConsumo,
        )
        _zc.balance = new Balance(TCB.produccion, _consumo, _zc.coefEnergia)
        _zc.economico = new Economico(_zc)
      }
      console.log('recalculo fincas')
      //Calcular balance y economico de las fincas
      console.log(TCB.Finca)
      for (let _f of TCB.Finca) {
        if (_f.participa && _f.nombreTipoConsumo !== '') {
          _consumo = TCB.TipoConsumo.find(
            (_tc) => _tc.nombreTipoConsumo === _f.nombreTipoConsumo,
          )
          console.log('A balance de ', JSON.stringify(_f), ' con', _f.coefEnergia)
          _f.balance = new Balance(TCB.produccion, _consumo, _f.coefEnergia)
          _f.economico = new Economico(_f)
          console.log(_f)
        }
      }
    }
    TCB.requiereReparto = false
  }

  document.body.style.cursor = cursorOriginal
  return { status: true }
}
