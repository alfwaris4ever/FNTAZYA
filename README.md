# FNTAZYA

موقع فنتازيا لألعاب الأطفال بالعربي: https://fntazya.com

## الفروع
| الفرع | دوره |
|---|---|
| `dev-faris`, `dev-sama` | فروع الموظفين. الرفع عليها يشغّل `CI (dev)` فقط، ثم Pull Request إلى `dev`. |
| `dev` | الفرع الافتراضي. يصله الكود من فروع الموظفين عبر Pull Request، والمالك يرفع عليه مباشرة. |
| `staging` | يصله نفس الـ commit من `dev` تلقائياً بعد نجاح `CI (dev)`. |
| `main` | يصله من `staging` تلقائياً بعد نجاح `CI (staging)`، ثم يُرفع تلقائياً عبر FTP إلى الموقع ويُتحقق منه. |

السلسلة كلها في `.github/workflows/pipeline.yml`.

## الفحوصات
- `scripts/ci-check.mjs`: صياغة كل سكربت، وجود كل ملف مُشار إليه، صور `thumbs/`، وعدم وجود أسرار.
- `scripts/smoke-test.mjs`: يفتح الموقع في Chrome بدون واجهة ويتأكد أن الألعاب تظهر ولكل لعبة صورة.

حماية الفروع (Rulesets مفعّلة): لا يقبل `staging` إلا commit نجح في `CI (dev)`، ولا يقبل `main` إلا commit نجح في `CI (staging)`.

## بنية الملفات
كل لعبة في ملف مستقل داخل `js/games/`، والأساس في `js/core.js`، والمشترك في `js/lib.js`، والكتالوج والواجهة في `js/app.js`، والتنسيق في `css/style.css`. التفاصيل وطريقة العمل في **[CONTRIBUTING.md](CONTRIBUTING.md)**.
