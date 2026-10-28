# Content still to fill in

Every `[add ...]` placeholder in `src/content/`, plus a few decisions for Mark. Empty this list before launch.
Find them all with: `grep -rn "\[add" src/content`

## Placeholders on the site

- [ ] `src/content/profile.ts`: Fairdinkum, Field Systems Engineer. `[add what you do in this role once you start]` (or remove the line).
- [ ] `src/content/presentations.ts`: Network Security Seminar. `[add date and audience]` (where and when it was given).
- [ ] `src/content/presentations.ts`: Chem + Comp Sci Seminar (University of Richmond). `[add date]`.
- [ ] `src/content/presentations.ts`: Adaptive Basis Sets Seminar. `[add date and audience]`.
- [ ] `src/content/projects.ts`: disk-usage-monitor outcome. `[add results after the first scheduled runs]`, which matches the repo README's own placeholder.

- [ ] `src/content/interests.ts`: when the poems and music site is live, put its address in `creativeSite.url`. A "See poems and music of Mark" link then appears in About Mark/Interests (and in search).

- [ ] Home lab screenshots still missing: **00 Create the Azure VM** and **02 Promote to a domain controller**. Add them to `src/content/homelabScreenshots.ts` (and the images to `public/screenshots/home-lab/`).

## Decisions for Mark

- [ ] **Email.** The site uses `mlpplowright@gmail.com`, the address on your resume and old portfolio. To use a different one, change `email` in `src/content/profile.ts`.
- [ ] **Resume PDF.** `public/resume.pdf` is the 2026–2027 version you supplied. It does not list Fairdinkum yet; replace the file when you update it. It also shows your phone number.
- [ ] **Lab IP addresses.** The Network Map uses sample IPs (10.0.0.4 and 10.0.0.5), labelled as sample addresses. Machine names and the domain (PLOWVM, PLOWCLIENT, plowlab.local) are real, from the repo.
- [ ] **Earlier projects.** Sanare and PIMM sit in "Work & Projects/Earlier projects". Move or drop them in `src/content/projects.ts` (`earlier: true`).
- [ ] **Ticket Queue.** Removed from the plan. Add your own examples later as a new app (see the README).

## Done

- [x] LinkedIn link (from the old portfolio): linkedin.com/in/mark-plowright-a667a1167
- [x] Resume PDF at `public/resume.pdf`
- [x] Real presentation titles, summaries and PDFs (3 decks), plus the CSC 4111 paper and the CRC Symposium publication
- [x] Project case studies from the GitHub READMEs: Windows Server Home Lab, Admin Practice Lab, endpoint-health-audit, disk-usage-monitor, Network Traffic Analysis, GradAisle, Sanare, PIMM
