# ევრისტიკა — Priority, Severity, Behavior

## Priority / Severity

| სცენარი | priority | severity |
|---|---|---|
| მთავარი ფლოუ (happy path — წარმატებული სცენარი) | `high` | `critical` |
| ვალიდაცია / სავალდებულო ველი | `high` | `major` |
| Boundary / Edge Case (ზღვრული / სასაზღვრო შემთხვევა) | `high` | `major` |
| უფლებების კონტროლი | `high` | `major` |
| სერვისის შეცდომის დამუშავება | `high` | `critical` |
| UI / ხილვადობა / სორტირება | `medium` | `normal` |
| Known Issue / Dummy Data | `low` | `minor` |

> **Known Issue წესები:** `priority=low`, `severity=minor`, `behavior=positive` (ვაფიქსირებთ ამჟამინდელ ქცევას, არა Bug-ს). `preconditions`-ში სავალდებულოდ: `Known Issue: [აღწერა]`.

---

## Behavior

| სათაურის პატერნი | behavior |
|---|---|
| არასწორი მონაცემებით | `negative` |
| სავალდებულო ცარიელი ველებით | `negative` |
| დუბლიკატი / დუბლირებული | `negative` |
| დაუშვებელი მიმდევრობა | `negative` |
| ... უფლების გარეშე | `negative` |
| სერვისის მიუწვდომლობა / შეცდომა | `negative` |
| read-only (მხოლოდ წასაკითხი) შეუძლებლობა | `negative` |
| წარმატებული / სწორი სცენარი | `positive` |
| ხილვადობა / ნავიგაცია | `positive` |
| ისტორიული მონაცემების შენარჩუნება | `positive` |

---

## Naming — ხშირი შეცდომები

| ❌ არასწორი | ✅ სწორი |
|---|---|
| Eschooll | Eschool |
| pagenation | pagination |
| შემოწება | შემოწმება |