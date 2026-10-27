// The Network Map app: Mark's Windows Server home lab in Azure.
// Machine names and the domain come from the windows-server-home-lab repo.
// IP addresses are sample values (the repo does not publish the real ones).

export type LabNode = { id: string; name: string; role: string; ip: string; text: string };

export const lab = {
  title: 'Windows Server home lab in Azure (plowlab.local)',
  vnetLabel: 'AZURE VNET (sample addresses)',
  domain: 'plowlab.local',
  nodes: [
    {
      id: 'admin',
      name: 'Admin Mac',
      role: 'Remote Desktop client',
      ip: '203.0.113.10',
      text: 'Mark manages the lab over Remote Desktop (RDP) from a Mac. RDP is limited to his own IP address, and the VMs auto-shut down at night to control cost.',
    },
    {
      id: 'dc',
      name: 'PLOWVM',
      role: 'Domain controller',
      ip: '10.0.0.4',
      text: 'Windows Server 2025 Datacenter: Azure Edition (2 vCPUs, 4 GiB RAM). Runs AD DS and DNS for plowlab.local, six GPOs, a shared folder mapped by GPO, and FSRM quotas and file screens.',
    },
    {
      id: 'client',
      name: 'PLOWCLIENT',
      role: 'Domain-joined client',
      ip: '10.0.0.5',
      text: 'A Windows 11 client in the same virtual network, joined to plowlab.local and used to test Group Policy with gpupdate /force and gpresult. Its DNS had to point at PLOWVM before it could find the domain.',
    },
  ] satisfies LabNode[],
  rdpNote: "RDP, Mark's IP only",
  idleText: 'Pick a tool to run it against the selected machine. Output is sample data.',
};
