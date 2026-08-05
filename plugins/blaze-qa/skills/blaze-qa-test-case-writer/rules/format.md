# ფორმატი — Qase.io JSON სქემა

## გამოსავალი ფორმატი

გამოსავალი არის **JSON** (არა CSV), Qase.io-ს იმპორტის ზუსტი სქემით.

### root სტრუქტურა

root-ში **მხოლოდ** `suites` მასივი უნდა იყოს.
❌ არასოდეს დადო root-ში `project`, `story`, `total`, `cases` ან სხვა მეტა-ველი.

```json
{
  "suites": [
    {
      "title": "[Suite სახელი]",
      "description": "https://blazeteam.atlassian.net/browse/[ISSUE-KEY]",
      "preconditions": null,
      "suites": [],
      "cases": []
    }
  ]
}
```

### case ობიექტი — ზუსტად 19 გასაღები

| ველი | მნიშვნელობა |
|---|---|
| `title` | სათაური |
| `description` | მოკლე აღწერა |
| `preconditions` | ერთი ბლოკი, `\n`-ის გარეშე |
| `postconditions` | `null` |
| `priority` | `high` / `medium` / `low` |
| `severity` | `critical` / `major` / `normal` / `minor` |
| `type` | `functional` |
| `behavior` | `positive` / `negative` |
| `automation` | `is-not-automated` |
| `status` | `actual` |
| `is_flaky` | `no` |
| `layer` | `unknown` |
| `milestone` | `null` |
| `custom_fields` | `[]` |
| `steps_type` | `classic` |
| `steps` | ნაბიჯების მასივი |
| `tags` | `[]` |
| `params` | `[]` |
| `is_muted` | `no` (**არა ცარიელი**) |

### step ობიექტი — სავალდებულო ველები

```json
{
  "position": 1,
  "action": "ვაწვებით ღილაკს",
  "expected_result": "გვერდი იხსნება",
  "data": "",
  "steps": []
}
```

- `position` — 1-დან, თანმიმდევრული
- `expected_result` — ყოველ ნაბიჯს **სავალდებულოდ** ახლავს
- `data` — ჩვეულებრივ `""`; მნიშვნელობები ჩაშენებულია `action`-ში
- `steps` — ყოველთვის `[]`

---

## Node.js გენერატორის შაბლონი

გარემო: გამოიყენე **Node.js** (`node`). Windows-ზე `python`/`python3` ხშირად stub-ია.

```js
const fs = require("fs");
const SUITE = "[Suite სახელი]";
const STORY_URL = "https://blazeteam.atlassian.net/browse/[ISSUE-KEY]";

function makeCase(title, desc, pre, prio, sev, beh, actions, results) {
  if (title.startsWith(SUITE + " - ")) title = title.slice((SUITE + " - ").length);
  if (actions.length !== results.length) throw new Error("actions/results mismatch: " + title);
  if (pre.includes("\n")) throw new Error("newline in preconditions: " + title);
  const steps = actions.map((a, i) => ({
    position: i + 1, action: a, expected_result: results[i], data: "", steps: []
  }));
  return {
    title, description: desc, preconditions: pre, postconditions: null,
    priority: prio, severity: sev, type: "functional", behavior: beh,
    automation: "is-not-automated", status: "actual", is_flaky: "no",
    layer: "unknown", milestone: null, custom_fields: [], steps_type: "classic",
    steps, tags: [], params: [], is_muted: "no"
  };
}

const cases = [ /* makeCase(...) */ ];

const doc = { suites: [{ title: SUITE, description: STORY_URL, preconditions: null, suites: [], cases }] };

fs.writeFileSync("[ISSUE-KEY] - [სთორის დასახელება].json", JSON.stringify(doc), "utf8");
```

**გამოსავალი ფაილი:**
- დირექტორია: განისაზღვრება `CLAUDE.local.md`-ში (თითო ტესტერი საკუთარს ინახავს)
- სახელი: `[ISSUE-KEY] - [სთორის დასახელება].json`
  (სთორის დასახელება = Jira issue-ს `summary` ველი, ზუსტად)

---

## Suite-ის სტრუქტურა

```
[პროდუქტი]              ← root = პროდუქტის სახელი (მაგ. Eschool)
  └── [მოდული]           ← მაგ. მოსწავლეები
        └── [ქვე-მოდული] ← მაგ. გაცდენების ექსტერნი
```

Suite სახელი = ყველაზე ქვედა დონის ჩანართი/გვერდი.
Root (`[პროდუქტი]`) აიღება მიმდინარე პროექტის `CLAUDE.md`-იდან; თუ იქ არ არის მითითებული, დააზუსტე მომხმარებელთან.
