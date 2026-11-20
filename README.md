# FNTAZYA

موقع فنتازيا لألعاب الأطفال بالعربي: https://fntazya.com

## الفروع
| الفرع | دوره |
|---|---|
| `dev` | الفرع الافتراضي. كل تعديل يُرفع إليه مباشرة. |
| `staging` | يصله نفس الـ commit من `dev` تلقائياً بعد نجاح `CI (dev)`. |
| `main` | يصله من `staging` تلقائياً بعد نجاح `CI (staging)`، وHostinger ينشره على الموقع. |

السلسلة كلها في `.github/workflows/pipeline.yml`.

## الفحوصات
- `scripts/ci-check.mjs`: صياغة كل سكربت، وجود كل ملف مُشار إليه، صور `thumbs/`، وعدم وجود أسرار.
- `scripts/smoke-test.mjs`: يفتح الموقع في Chrome بدون واجهة ويتأكد أن الألعاب تظهر ولكل لعبة صورة.

حماية الفروع (Rulesets مفعّلة): لا يقبل `staging` إلا commit نجح في `CI (dev)`، ولا يقبل `main` إلا commit نجح في `CI (staging)`.
