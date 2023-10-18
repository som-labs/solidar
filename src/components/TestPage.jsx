/// This is a sand box to test isolated components
import AppFrame from './AppFrame'
import { WizardExample } from './Wizard'

export default function TestPage() {
  return <AppFrame>{[false && <WizardExample />, true && <WizardExample />]}</AppFrame>
}
