// Sample security and system events for the Event Viewer / Console / Logs app.
// These are teaching examples, not real incidents.
export type SampleEvent = { title: string; source: string; level: 'Information' | 'Warning' | 'Error'; time: string; means: string; fix: string };

export const events: SampleEvent[] = [
  {
    title: 'Failed sign-in: 5 attempts in 2 minutes',
    source: 'Security', level: 'Warning', time: '09:12',
    means: 'Repeated wrong passwords against one account can be password guessing, or a user who forgot a recent change.',
    fix: 'Confirm with the user first. If it was not them, lock the account, reset the password, check sign-in locations and make sure MFA is on.',
  },
  {
    title: 'New device registered',
    source: 'Security', level: 'Information', time: '09:40',
    means: 'A new device was added to the account.',
    fix: 'Check that the user recognises it. If not, remove the device, revoke active sessions and reset credentials.',
  },
  {
    title: 'MFA prompt denied 3 times',
    source: 'Security', level: 'Warning', time: '10:05',
    means: 'Someone may be sending sign-in requests the user did not start, sometimes called MFA fatigue.',
    fix: 'Call the user, reset their password, review recent sign-ins and switch to number matching if available.',
  },
  {
    title: 'Disk space low on FILESRV01',
    source: 'System', level: 'Warning', time: '11:20',
    means: 'The data volume is nearly full, which can stop saves and backups.',
    fix: 'Find large files with a disk usage tool, clear temporary data, extend the volume if needed and add an alert at 85 percent.',
  },
  {
    title: 'Group Policy applied successfully',
    source: 'System', level: 'Information', time: '11:31',
    means: 'The policy refresh finished without errors.',
    fix: 'No action. Useful as a baseline when comparing a machine that is failing to apply policy.',
  },
  {
    title: 'Service stopped unexpectedly: Print Spooler',
    source: 'System', level: 'Error', time: '13:02',
    means: 'A service crashed, often after a driver or update change.',
    fix: 'Restart the service, check recent driver changes, read the error details and remove the faulty driver if it repeats.',
  },
];
