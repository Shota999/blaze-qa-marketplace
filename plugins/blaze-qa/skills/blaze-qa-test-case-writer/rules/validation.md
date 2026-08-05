# ვალიდაცია — გენერაციის შემდგომი შემოწმება

## ტექნიკური ვალიდაცია (section 12)

გენერაციის შემდეგ სავალდებულო შემოწმების სია:

- [ ] root-ში მხოლოდ `suites` მასივია
- [ ] ქეისები დევს `suites[].cases`-ში (არა root-ში)
- [ ] suite-ს აქვს: `title, description, preconditions, suites, cases`
- [ ] თითო case-ს აქვს ზუსტად 19 გასაღები
- [ ] `postconditions` = `null`, `is_muted` = `"no"`
- [ ] case-ში **არ** არის ზედმეტი ველი (`suite`, `suite_path` და სხვ.)
- [ ] თითო step-ს აქვს: `position, action, expected_result, data, steps`
- [ ] თითო step-ში `steps` = `[]`
- [ ] `preconditions`-ში `\n` არ არის
- [ ] ყოველ ნაბიჯს აქვს `expected_result`
- [ ] `action`-ში ბრძანებლური ზმნები არ რჩება (თავაზიანი „ჩვენ"-ფორმა)
- [ ] `behavior` სწორად არის დაყენებული
- [ ] ქეისის `title` **არ** იწყება სუიტის დასახელებით

### Node.js ვალიდატორი

```js
const fs = require("fs");
const mine = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const exp  = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], "utf8")) : null;

const eq = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
if (!Array.isArray(mine.suites)) throw new Error("root: 'suites' მასივი აკლია");

const mc = mine.suites[0].cases;
if (!mc.length) throw new Error("suite-ში ქეისები არ არის");
const EM = "\u2014";
const checkEmDash = (text, label) => { if (text && text.includes(EM)) throw new Error("em dash აკრძალულია (" + label + "): " + text.slice(0, 60)); };
for (const c of mc) {
  if (c.preconditions.includes("\n")) throw new Error("newline in preconditions: " + c.title);
  if (c.postconditions !== null) throw new Error("postconditions must be null: " + c.title);
  if (c.is_muted !== "no") throw new Error("is_muted must be 'no': " + c.title);
  checkEmDash(c.title, "title");
  checkEmDash(c.description, "description");
  checkEmDash(c.preconditions, "preconditions");
  for (const s of c.steps) {
    if (!Array.isArray(s.steps)) throw new Error("step.steps must be []: " + c.title);
    if (!s.action || !s.expected_result) throw new Error("step missing action/result: " + c.title);
    checkEmDash(s.action, "action");
    checkEmDash(s.expected_result, "expected_result");
  }
}
if (exp) {
  const ec = exp.suites[0].cases[0];
  if (!eq(Object.keys(mc[0]), Object.keys(ec))) throw new Error("case keys ≠ export");
  if (!eq(Object.keys(mc[0].steps[0]), Object.keys(ec.steps[0]))) throw new Error("step keys ≠ export");
  if (!eq(Object.keys(mine.suites[0]), Object.keys(exp.suites[0]))) throw new Error("suite keys ≠ export");
}
console.log("✅ ვალიდაცია გავლილია —", mc.length, "ქეისი");
```

გაშვება: `node validate.js "ES-XXXX - სთორი.json"` (სურვილისამებრ + export ნიმუში მეორე არგუმენტად)

---

## შინაარსობრივი გადამოწმება (section 13)

ტექნიკური ვალიდაციის გარდა, სავალდებულოა **შინაარსობრივი** გადამოწმება:

### სათაურები
- [ ] em dash (`—`) არ გამოიყენება **არცერთ ველში** (title, description, preconditions, action, expected_result) — მხოლოდ ` - `
- [ ] სიტყვები სრულად — შემოკლება დაუშვებელია
- [ ] სუიტის სახელი ქეისის სათაურში არ მეორდება
- [ ] ინგლისური ტერმინები სათაურში არ გამოიყენება

### ნაბიჯების ტონი
- [ ] ყველა ზმნა „ჩვენ"-ფორმაშია
- [ ] ბრძანებლური ფორმა (`დააჭირე`, `შეამოწმე`) არ რჩება

### სიის გვერდის სავალდებულო ქეისები
- [ ] ინტეგრირებული სცენარი (სორტირება + ფილტრი + ძებნა ერთდროულად) — **სავალდებულოა**
- [ ] ყველა სორტირებადი სვეტი დაფარულია (ტექსტური, რიცხვითი, **თარიღული**)
- [ ] სვეტების კონფიგურაციის persistence (შენარჩუნება): refresh (გვერდის განახლება) **და** ხელახლა შესვლა
- [ ] ფილტრის ყველა ქვე-ჯგუფიდან მინიმუმ ერთი ქეისი

### Coverage (section 8)
- [ ] 12 ჯგუფიდან ყოველიდან მინიმუმ ერთი ქეისი
- [ ] ყველა სავალდებულო ველი ცალ-ცალკე ტესტდება

### მოქმედება
- **პრობლემა აღმოჩნდა** → გაასწორე დაუყოვნებლივ და ხელახლა დააგენერირე
- **ყველაფერი სწორია** → მომხმარებელს მოკლედ აცნობე (1-2 წინადადება)
