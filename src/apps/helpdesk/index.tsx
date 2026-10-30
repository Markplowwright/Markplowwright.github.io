// Help Desk app (desktop window). "Try it" buttons open the Terminal with the
// command, another app, or a screenshot folder.
import { HelpDeskView } from './HelpDeskView';
import { openApp, openNode } from '../../os/actions';
import { useTermQueue } from '../terminal/queue';
import type { TryIt } from '../../content/helpdesk';

export function tryOnDesktop(x: TryIt) {
  if ('terminal' in x) {
    useTermQueue.getState().send({ cmd: x.terminal, os: x.os });
    openApp('terminal');
  } else if ('app' in x) openApp(x.app);
  else openNode(x.node);
}

export default function HelpDeskApp() {
  return <HelpDeskView onTry={tryOnDesktop} />;
}
