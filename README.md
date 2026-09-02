# blaze-qa — blazeteam QA Toolkit (Claude Code plugin)

blazeteam-ის Manual QA ინსტრუმენტები Claude Code-ისთვის. მუშაობს Eschool-ზე
და კომპანიის სხვა პროდუქტებზე (პროდუქტ-სპეციფიკა აიღება პროექტის `CLAUDE.md`-იდან).

## რას შეიცავს

| კომპონენტი | ტიპი | დანიშნულება |
|---|---|---|
| `blaze-qa-test-case-writer` | skill | Qase.io JSON ტესტ-ქეისების გენერაცია Jira სთორიდან |
| `blaze-qa-testing-checklist` | skill | Jira Testing Checklist-ის გენერაცია |
| `eschool-testcase-steps-merge` | skill | .xlsx workbook-ის "classic" და "Test Cases" sheet-ების გაერთიანება (Steps/Results სვეტები) |
| `/qa-test-planner <KEY>` | command | ტესტ-ქეისების დაწერის ბრძანება |
| `/qa-checklist <KEY>` | command | Testing Checklist-ის ბრძანება |

## ინსტალაცია (გუნდის თითო წევრი)

1. Marketplace-ის დამატება (GitHub shorthand — შეცვალე შენი repo-თი):

   ```bash
   /plugin marketplace add <owner>/blaze-qa-marketplace
   ```

   ან სრული git URL-ით (GitLab/Bitbucket და სხვ.):

   ```bash
   /plugin marketplace add https://git.blaze.ge/qa/blaze-qa-marketplace.git
   ```

2. Plugin-ის ინსტალაცია:

   ```bash
   /plugin install blaze-qa@blaze-qa
   ```

3. Claude Code-ის გადატვირთვა (ან ახალი სესია).

## განახლება

```bash
/plugin marketplace update blaze-qa
```

ახალი ვერსია მიდის მაშინ, როცა `plugins/blaze-qa/.claude-plugin/plugin.json`-ში
`version` შეიცვლება.

## პროდუქტ-სპეციფიკური კონფიგი

სქილები კომპანია-wide-ია. თითო პროდუქტის პროექტში დაამატე თხელი `CLAUDE.md`:

```markdown
# <პროდუქტის> QA — კონფიგი
- Suite root: Portal
- Jira project: POR
- Output დირექტორია: C:\...\QA\Portal
- Out of Scope (პროდუქტ-სპეციფიკური):
  - <რაც არ ტესტირდება>
```

## სტრუქტურა

```
blaze-qa-marketplace/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── blaze-qa/
│       ├── .claude-plugin/plugin.json
│       ├── commands/            (qa-test-planner, qa-checklist)
│       └── skills/
│           ├── blaze-qa-test-case-writer/   (SKILL.md + rules/)
│           ├── blaze-qa-testing-checklist/  (SKILL.md)
│           └── eschool-testcase-steps-merge/ (SKILL.md + scripts/)
└── README.md
```
