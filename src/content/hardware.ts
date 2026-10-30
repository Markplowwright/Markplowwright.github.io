// The pretend computer's hardware, one machine per skin, for Device Manager /
// System Information / Hardware and the Terminal's systeminfo,
// system_profiler, lshw and lsusb. Names, MAC addresses and OS versions match
// what ipconfig, ifconfig, ip a and uname already print (terminal/network.ts).
import { NET } from '../apps/terminal/network';
import type { SkinId } from '../os/types';

export type Spec = { label: string; value: string };
export type Device = { name: string; driver?: { provider: string; version: string; date: string } };
export type DeviceGroup = { category: string; devices: Device[] };

/** A device with a problem a visitor can troubleshoot. */
export type Problem = {
  device: string;
  category: string;
  /** What the device shows while broken. */
  status: string;
  /** Background, as if from the ticket. */
  story: string;
  actions: { id: string; label: string; result: string; fixes: boolean }[];
  fixedStatus: string;
};

export const appTitle: Record<SkinId, string> = { windows: 'Device Manager', mac: 'System Information', linux: 'Hardware' };

// ---------------------------------------------------------------- Windows

const winDrv = (provider: string, version: string, date: string) => ({ provider, version, date });

export const windowsDevices: DeviceGroup[] = [
  { category: 'Audio inputs and outputs', devices: [{ name: 'Microphone Array (Realtek(R) Audio)' }, { name: 'Speakers (Realtek(R) Audio)' }] },
  { category: 'Batteries', devices: [{ name: 'Microsoft ACPI-Compliant Control Method Battery' }, { name: 'Microsoft AC Adapter' }] },
  {
    category: 'Bluetooth',
    devices: [
      { name: 'Intel(R) Wireless Bluetooth(R)', driver: winDrv('Intel Corporation', '23.60.0.1', '6/14/2026') },
      { name: 'Microsoft Bluetooth Enumerator' },
    ],
  },
  { category: 'Cameras', devices: [{ name: 'Integrated Webcam', driver: winDrv('Realtek', '10.0.22000.20334', '3/2/2026') }] },
  { category: 'Disk drives', devices: [{ name: 'SAMSUNG MZVL2512HCJQ-00BL7 (512 GB NVMe)', driver: winDrv('Microsoft', '10.0.22621.3672', '6/21/2006') }] },
  { category: 'Display adapters', devices: [{ name: 'Intel(R) Iris(R) Xe Graphics', driver: winDrv('Intel Corporation', '31.0.101.5186', '1/12/2026') }] },
  { category: 'Firmware', devices: [{ name: 'System Firmware (Dell BIOS 1.14.0)' }] },
  { category: 'Human Interface Devices', devices: [{ name: 'HID-compliant touch pad' }, { name: 'Dell Peripheral Manager' }] },
  { category: 'Keyboards', devices: [{ name: 'Standard PS/2 Keyboard' }] },
  { category: 'Mice and other pointing devices', devices: [{ name: 'HID-compliant mouse' }] },
  { category: 'Monitors', devices: [{ name: 'Generic PnP Monitor (14-inch, 1920 x 1200)' }] },
  {
    category: 'Network adapters',
    devices: [
      { name: 'Intel(R) Wi-Fi 6E AX211 160MHz', driver: winDrv('Intel', '23.60.1.2', '6/2/2026') },
      { name: 'Bluetooth Device (Personal Area Network)' },
      { name: 'WAN Miniport (IKEv2)' },
    ],
  },
  { category: 'Print queues', devices: [{ name: 'HP LaserJet (Front office)' }, { name: 'Microsoft Print to PDF' }] },
  { category: 'Processors', devices: Array.from({ length: 12 }, () => ({ name: '13th Gen Intel(R) Core(TM) i7-1365U' })) },
  { category: 'Security devices', devices: [{ name: 'Trusted Platform Module 2.0' }] },
  { category: 'Storage controllers', devices: [{ name: 'Standard NVM Express Controller' }] },
  { category: 'System devices', devices: [{ name: 'ACPI Thermal Zone' }, { name: 'Intel(R) Management Engine Interface' }, { name: 'PCI Express Root Complex' }] },
  { category: 'Universal Serial Bus controllers', devices: [{ name: 'Intel(R) USB 3.20 eXtensible Host Controller' }, { name: 'USB Root Hub (USB 3.0)' }] },
];

export const windowsSummary: Spec[] = [
  { label: 'OS Name', value: 'Microsoft Windows 11 Pro' },
  { label: 'Version', value: '10.0.22631 Build 22631' },
  { label: 'System Name', value: NET.host.windows },
  { label: 'System Manufacturer', value: 'Dell Inc.' },
  { label: 'System Model', value: 'Latitude 5440' },
  { label: 'System Type', value: 'x64-based PC' },
  { label: 'Processor', value: '13th Gen Intel(R) Core(TM) i7-1365U, 1800 Mhz, 10 Core(s), 12 Logical Processor(s)' },
  { label: 'BIOS Version/Date', value: 'Dell Inc. 1.14.0, 4/9/2026' },
  { label: 'Installed Physical Memory (RAM)', value: '16.0 GB' },
  { label: 'Storage', value: '512 GB NVMe SSD, 287 GB free' },
  { label: 'Domain', value: NET.domain },
  { label: 'Network adapter', value: `Intel(R) Wi-Fi 6E AX211 160MHz, ${NET.ip}, MAC ${NET.macAddr.windows}` },
  { label: 'Secure Boot State', value: 'On' },
  { label: 'TPM', value: '2.0, ready' },
];

// ---------------------------------------------------------------- macOS

export const macSections: { group: string; items: { name: string; specs: Spec[] }[] }[] = [
  {
    group: 'Hardware',
    items: [
      {
        name: 'Hardware Overview',
        specs: [
          { label: 'Model Name', value: 'MacBook Pro' },
          { label: 'Model Identifier', value: 'Mac15,6' },
          { label: 'Chip', value: 'Apple M3 Pro' },
          { label: 'Total Number of Cores', value: '11 (5 performance and 6 efficiency)' },
          { label: 'Memory', value: '18 GB' },
          { label: 'System Firmware Version', value: '11881.41.5' },
          { label: 'Serial Number (system)', value: 'C02XG3PRMD6T' },
          { label: 'Activation Lock Status', value: 'Disabled' },
        ],
      },
      { name: 'Bluetooth', specs: [] },
      { name: 'Graphics/Displays', specs: [{ label: 'Chipset Model', value: 'Apple M3 Pro (14-core GPU)' }, { label: 'Display', value: 'Built-in Liquid Retina XDR Display, 3024 x 1964 Retina' }] },
      { name: 'Memory', specs: [{ label: 'Memory', value: '18 GB' }, { label: 'Type', value: 'LPDDR5' }, { label: 'Manufacturer', value: 'Micron' }] },
      { name: 'Power', specs: [{ label: 'Cycle Count', value: '142' }, { label: 'Condition', value: 'Normal' }, { label: 'Maximum Capacity', value: '96%' }, { label: 'Charging', value: 'No' }] },
      { name: 'Storage', specs: [{ label: 'Macintosh HD', value: '494.38 GB (APFS), 312.6 GB available' }, { label: 'Medium Type', value: 'SSD' }, { label: 'FileVault', value: 'On' }] },
      { name: 'USB', specs: [{ label: 'USB 3.1 Bus', value: 'No devices connected' }, { label: 'Thunderbolt/USB4', value: '3 ports' }] },
    ],
  },
  {
    group: 'Network',
    items: [
      { name: 'Wi-Fi', specs: [{ label: 'Interface', value: 'en0' }, { label: 'MAC Address', value: NET.macAddr.mac }, { label: 'IPv4 Address', value: NET.ip }, { label: 'Router', value: NET.gateway }, { label: 'DNS Server', value: NET.dns }, { label: 'PHY Mode', value: '802.11ax' }] },
    ],
  },
  {
    group: 'Software',
    items: [
      { name: 'Software Overview', specs: [{ label: 'System Version', value: 'macOS 15.1 (24B83)' }, { label: 'Kernel Version', value: 'Darwin 24.1.0' }, { label: 'Computer Name', value: NET.host.mac }, { label: 'User Name', value: 'Mark Plowright (mark)' }, { label: 'Secure Virtual Memory', value: 'Enabled' }, { label: 'System Integrity Protection', value: 'Enabled' }] },
    ],
  },
];

// ---------------------------------------------------------------- Linux

export const linuxSections: { name: string; specs: Spec[] }[] = [
  {
    name: 'About',
    specs: [
      { label: 'Hardware Model', value: 'Lenovo ThinkPad T14 Gen 4' },
      { label: 'Processor', value: 'AMD Ryzen 7 PRO 7840U w/ Radeon 780M Graphics x 16' },
      { label: 'Memory', value: '32.0 GiB' },
      { label: 'Disk Capacity', value: '1.0 TB' },
      { label: 'OS Name', value: 'Ubuntu 24.04.1 LTS' },
      { label: 'OS Type', value: '64-bit' },
      { label: 'Kernel Version', value: 'Linux 6.8.0-45-generic' },
      { label: 'Windowing System', value: 'Wayland' },
      { label: 'Device Name', value: NET.host.linux },
    ],
  },
  { name: 'CPU', specs: [{ label: 'Model', value: 'AMD Ryzen 7 PRO 7840U' }, { label: 'Cores / threads', value: '8 / 16' }, { label: 'Max speed', value: '5.1 GHz' }] },
  { name: 'Memory', specs: [{ label: 'Total', value: '32 GiB LPDDR5x' }, { label: 'Swap', value: '8 GiB' }] },
  { name: 'Display', specs: [{ label: 'Graphics', value: 'AMD Radeon 780M' }, { label: 'Screen', value: '14-inch, 1920 x 1200' }] },
  { name: 'Network', specs: [{ label: 'Wi-Fi', value: 'Intel Wi-Fi 6E AX211 (wlp2s0)' }, { label: 'MAC address', value: NET.macAddr.linux }, { label: 'IPv4 address', value: `${NET.ip}/24` }, { label: 'Gateway', value: NET.gateway }, { label: 'DNS', value: NET.dns }] },
  { name: 'Storage', specs: [{ label: 'nvme0n1', value: 'SK hynix 1 TB NVMe SSD' }, { label: '/', value: 'ext4, 712 GB free' }] },
  { name: 'Bluetooth', specs: [] },
  { name: 'USB', specs: [{ label: 'Bus 001 Device 002', value: 'Intel AX211 Bluetooth' }, { label: 'Bus 001 Device 003', value: 'Chicony Integrated Camera' }] },
];

// ---------------------------------------------------------------- the problem

export const problems: Record<SkinId, Problem> = {
  windows: {
    device: 'Intel(R) Wireless Bluetooth(R)',
    category: 'Bluetooth',
    status: 'Windows has stopped this device because it has reported problems. (Code 43)',
    story: 'The user says their Bluetooth headset stopped connecting this morning. What changed? Windows Update installed a new Bluetooth driver (23.60.0.1) last night.',
    actions: [
      { id: 'restart', label: 'Disable and enable the device', result: 'Disabled, then enabled. Still Code 43. A quick restart of the device is worth trying first, but it did not help, so the problem is not a one-off glitch.', fixes: false },
      { id: 'update', label: 'Update driver', result: '"The best drivers for your device are already installed." Windows thinks 23.60.0.1 is fine, so updating changes nothing.', fixes: false },
      { id: 'rollback', label: 'Roll back driver', result: 'Rolled back to 23.40.0.2, the driver from before the update. The device restarted and reports "This device is working properly." The update was the cause. Next: pause the Bluetooth driver update and note it in the ticket.', fixes: true },
    ],
    fixedStatus: 'This device is working properly.',
  },
  mac: {
    device: 'Bluetooth',
    category: 'Hardware',
    status: 'State: Unavailable. Bluetooth is stuck and will not turn on.',
    story: "The user's Magic Mouse stopped working and Bluetooth shows as unavailable after the Mac woke from sleep.",
    actions: [
      { id: 'toggle', label: 'Turn Bluetooth off and on', result: 'The switch in Control Center is greyed out, so it cannot be toggled. The Bluetooth service itself is stuck.', fixes: false },
      { id: 'reset', label: 'Reset the Bluetooth module (sudo pkill bluetoothd)', result: 'macOS restarts the Bluetooth service on its own. State is now On and the mouse reconnects. Restarting the service clears a stuck state after sleep without a full restart.', fixes: true },
    ],
    fixedStatus: 'State: On',
  },
  linux: {
    device: 'Bluetooth (hci0)',
    category: 'Bluetooth',
    status: 'hci0: DOWN. Soft blocked by rfkill.',
    story: 'The user turned on airplane mode on the train, turned it off at work, and now Bluetooth will not come back.',
    actions: [
      { id: 'service', label: 'Restart the service (sudo systemctl restart bluetooth)', result: 'The service restarts, but hci0 stays down. The service is fine; something is switching the radio off.', fixes: false },
      { id: 'rfkill', label: 'Check the radio switch (rfkill list)', result: '1: hci0: Bluetooth\n    Soft blocked: yes\n    Hard blocked: no\nA software switch (left over from airplane mode) is blocking it. No hardware switch is involved.', fixes: false },
      { id: 'unblock', label: 'Unblock it (rfkill unblock bluetooth)', result: 'hci0 is UP and the headset pairs again. Airplane mode had blocked Bluetooth and turning it off did not lift the block.', fixes: true },
    ],
    fixedStatus: 'hci0: UP RUNNING',
  },
};

export const bluetoothSpecs: Record<'mac' | 'linux', (fixed: boolean) => Spec[]> = {
  mac: (fixed) => [
    { label: 'Address', value: 'A4:83:E7:2B:1C:4E' },
    { label: 'State', value: fixed ? 'On' : 'Unavailable' },
    { label: 'Chipset', value: 'BCM_4388' },
    { label: 'Firmware Version', value: '22.5.536.2810' },
    { label: 'Connected', value: fixed ? 'Magic Mouse' : 'None' },
  ],
  linux: (fixed) => [
    { label: 'Controller', value: 'hci0, Intel AX211 Bluetooth' },
    { label: 'State', value: fixed ? 'UP RUNNING' : 'DOWN' },
    { label: 'rfkill', value: fixed ? 'Soft blocked: no' : 'Soft blocked: yes' },
    { label: 'Driver', value: 'btusb (firmware ibt-0040-0041.sfi)' },
  ],
};

// ---------------------------------------------------------------- Terminal

export function systeminfoLines(): string[] {
  const row = (k: string, v: string) => `${`${k}:`.padEnd(27)}${v}`;
  return [
    '',
    row('Host Name', NET.host.windows),
    row('OS Name', 'Microsoft Windows 11 Pro'),
    row('OS Version', '10.0.22631 N/A Build 22631'),
    row('OS Manufacturer', 'Microsoft Corporation'),
    row('OS Configuration', 'Member Workstation'),
    row('OS Build Type', 'Multiprocessor Free'),
    row('Registered Owner', 'Mark Plowright'),
    row('System Manufacturer', 'Dell Inc.'),
    row('System Model', 'Latitude 5440'),
    row('System Type', 'x64-based PC'),
    row('Processor(s)', '1 Processor(s) Installed.'),
    `${''.padEnd(27)}[01]: Intel64 Family 6 Model 186 Stepping 3 GenuineIntel ~1800 Mhz`,
    row('BIOS Version', 'Dell Inc. 1.14.0, 4/9/2026'),
    row('Windows Directory', 'C:\\WINDOWS'),
    row('Boot Device', '\\Device\\HarddiskVolume1'),
    row('System Locale', 'en-us;English (United States)'),
    row('Time Zone', '(UTC-05:00) Eastern Time (US & Canada)'),
    row('Total Physical Memory', '16,103 MB'),
    row('Available Physical Memory', '8,912 MB'),
    row('Domain', NET.domain),
    row('Logon Server', '\\\\PLOWVM'),
    row('Network Card(s)', '1 NIC(s) Installed.'),
    `${''.padEnd(27)}[01]: Intel(R) Wi-Fi 6E AX211 160MHz`,
    `${''.padEnd(27)}      Connection Name: Wi-Fi`,
    `${''.padEnd(27)}      DHCP Enabled:    Yes`,
    `${''.padEnd(27)}      DHCP Server:     ${NET.gateway}`,
    `${''.padEnd(27)}      IP address(es)`,
    `${''.padEnd(27)}      [01]: ${NET.ip}`,
    `${''.padEnd(27)}      [02]: ${NET.ipv6.windows}`,
    row('Hyper-V Requirements', 'A hypervisor has been detected.'),
  ];
}

export function systemProfilerLines(type: string): string[] | null {
  const t = type.toLowerCase();
  if (t && t !== 'sphardwaredatatype') return null;
  const hw = macSections[0].items[0].specs;
  return ['Hardware:', '', '    Hardware Overview:', '', ...hw.map((s) => `      ${s.label}: ${s.value}`), ''];
}

export function lshwShortLines(): string[] {
  return [
    'WARNING: you should run this program as super-user.',
    'H/W path        Device      Class          Description',
    '======================================================',
    '                            system         ThinkPad T14 Gen 4 (21K3CTO1WW)',
    '/0                          bus            21K3CTO1WW',
    '/0/0                        memory         128KiB BIOS',
    '/0/4                        processor      AMD Ryzen 7 PRO 7840U w/ Radeon 780M Graphics',
    '/0/d                        memory         32GiB System Memory',
    '/0/100/2.4/0    /dev/nvme0  storage        SK hynix 1TB NVMe SSD',
    '/0/100/8.1/0    /dev/fb0    display        Phoenix1 (Radeon 780M)',
    `/0/100/2.2/0    wlp2s0      network        Wi-Fi 6E(802.11ax) AX211 160MHz`,
    '/0/100/8.3/0    usb1        bus            xHCI Host Controller',
    '/0/100/8.3/0/3  hci0        communication  Bluetooth wireless interface',
    '/0/100/8.1/1                multimedia     Rembrandt Radeon High Definition Audio',
  ];
}

export const lsusbLines = (): string[] => [
  'Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub',
  'Bus 001 Device 002: ID 8087:0033 Intel Corp. AX211 Bluetooth',
  'Bus 001 Device 003: ID 04f2:b7b6 Chicony Electronics Co., Ltd Integrated Camera',
  'Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub',
];
