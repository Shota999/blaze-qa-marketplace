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

---

## 🚀 ინსტალაცია — ახალი მომხმარებლისთვის

> წინაპირობა: დაინსტალირებული Claude Code და წვდომა ამ GitHub repo-ზე
> (თუ repo private-ია — სთხოვე owner-ს collaborator-ად დამატება).

**ნაბიჯი 1 — დაამატე marketplace** (Claude Code-ის ინტერაქტიულ სესიაში):

```bash
/plugin marketplace add Shota999/blaze-qa-marketplace
```

**ნაბიჯი 2 — დააინსტალირე plugin:**

```bash
/plugin install blaze-qa@blaze-qa
```

**ნაბიჯი 3 — გადატვირთე Claude Code** (ან დაიწყე ახალი სესია).

**ნაბიჯი 4 — შეამოწმე, რომ ჩაიტვირთა:**

```bash
/plugin
```

სიაში უნდა გამოჩნდეს `blaze-qa` (enabled) და ხელმისაწვდომი გახდება
3 სქილი + ბრძანებები `/qa-test-planner`, `/qa-checklist`.

### გამოყენება

- ტესტ-ქეისები: `/qa-test-planner ES-1234` ან „დამიწერე ტესტ-ქეისები ES-1234-ზე"
- Testing Checklist: `/qa-checklist ES-1234`
- ცხრილების გაერთიანება: „გააერთიანე ცხრილები" / „ნაბიჯები ჩაამატე"

### განახლების მიღება

როცა owner ახალ ვერსიას ატვირთავს:

```bash
/plugin marketplace update blaze-qa
```

### პროდუქტ-სპეციფიკური კონფიგი

სქილები კომპანია-wide-ია. თითო პროდუქტის პროექტში დაამატე თხელი `CLAUDE.md`:

```markdown
# <პროდუქტის> QA — კონფიგი
- Suite root: Portal
- Jira project: POR
- Output დირექტორია: C:\...\QA\Portal
- Out of Scope (პროდუქტ-სპეციფიკური):
  - <რაც არ ტესტირდება>
```

---

## 🛠️ ახალი სქილის დამატება (maintainer-ისთვის)

> **ოქროს წესი:** ცვლილება ყოველთვის **მხოლოდ ამ repo-ში** გააკეთე.
> არასოდეს დაარედაქტირო `~/.claude/skills/`-ში ან GitHub-ის ვებ-ინტერფეისში
> ცალკე — თორემ ორი განსხვავებული ასლი გაგიჩნდება.

**ნაბიჯი 1 — აიღე repo (პირველად):**

```bash
git clone https://github.com/Shota999/blaze-qa-marketplace.git
cd blaze-qa-marketplace
```

(თუ უკვე გაქვს — `git pull` ცვლილებების დაწყებამდე.)

**ნაბიჯი 2 — შექმენი სქილის ფოლდერი** `plugins/blaze-qa/skills/<skill-name>/`
და მასში `SKILL.md`. ფოლდერის სახელი **ზუსტად** უნდა ემთხვეოდეს frontmatter-ის
`name`-ს:

```markdown
---
name: <skill-name>
description: >-
  მოკლე, მკაფიო აღწერა — რას აკეთებს და როდის უნდა ამოქმედდეს.
  ეს ტექსტი წყვეტს, Claude სქილს გამოიძახებს თუ არა, ამიტომ ცხადად დაწერე
  trigger-ები (მაგ. /command ან ტიპური მოთხოვნის ფრაზები).
---

# სქილის სათაური

## ინსტრუქცია
...
```

- დამხმარე ფაილები (სკრიპტები, template-ები) იდე ქვე-ფოლდერებში:
  `scripts/`, `rules/` და ა.შ.
- (სურვილისამებრ) ბრძანება: `plugins/blaze-qa/commands/<cmd>.md`
  frontmatter-ში `description:` და სხეულში `$ARGUMENTS`.

**ნაბიჯი 3 — აწიე ვერსია** `plugins/blaze-qa/.claude-plugin/plugin.json`-ში:

| ცვლილება | ვერსია |
|---|---|
| typo / ტექსტის შესწორება | patch: `1.1.0 → 1.1.1` |
| ახალი სქილი / ფუნქცია | minor: `1.1.0 → 1.2.0` |
| შეუთავსებელი გადაკეთება | major: `1.1.0 → 2.0.0` |

⚠️ ვერსიის აწევის გარეშე ტესტერებამდე განახლება **არ მიდის**.

**ნაბიჯი 4 — დააკომიტე და აიტვირთე:**

```bash
git add -A
git commit -m "Add <skill-name> skill; bump to vX.Y.Z"
git push
```

**ნაბიჯი 5 — შეამოწმე ლოკალურად** (სანამ გუნდს ეტყვი):

```bash
/plugin marketplace update blaze-qa
```

### შემოწმების ჩეკლისტი (push-მდე)

- [ ] ფოლდერის სახელი == `SKILL.md`-ის `name`
- [ ] `description` ცხადად აღწერს trigger-ებს
- [ ] `plugin.json`-ში ვერსია აწეულია
- [ ] README-ს ცხრილში ახალი კომპონენტი დამატებულია
- [ ] `plugin.json` და `marketplace.json` ვალიდური JSON-ია

---

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
