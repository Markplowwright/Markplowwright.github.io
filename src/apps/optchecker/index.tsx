// OPT Employer Checker (desktop window).
import { OptCheckerView } from './OptCheckerView';
import { openNode } from '../../os/actions';

export default function OptCheckerApp() {
  return <OptCheckerView onOpenProject={() => openNode('p-opt')} />;
}
