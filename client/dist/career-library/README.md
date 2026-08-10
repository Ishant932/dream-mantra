# Dream Mantra — Career Library

Built by Claude for Dream Mantra (Tibrewal Enterprises), Jaipur.

## Folder Structure

```
career-library/
├── index.html              ← Main entry point (open this in browser)
├── css/
│   └── styles.css          ← All styles (navy/gold theme, accent colors)
├── js/
│   ├── app.js              ← State, career filters, render functions, tabs
│   ├── exams.js            ← Exam tab: state, filters, grid, modal
│   └── clusters.js         ← Cluster lookup + career modal render functions
├── data/
│   ├── careers-data.js     ← 1,211+ career pathways (stream-split)
│   ├── exams-data.js       ← 259 entrance exams with eligibility trees
│   ├── clusters-data.js    ← 22 cluster eligibility paths + courses + skills
│   └── meta-data.js        ← SUBJ_MAP, STREAM_MAP, DEMAND_ORDER, TABS
└── assets/                 ← Images, icons (add here)
```

## How to Open

### Option A — Direct browser (simplest)
Open `index.html` directly in Chrome/Edge/Firefox.

### Option B — Live Server in Cursor / VS Code
1. Open the `career-library/` folder in Cursor
2. Install "Live Server" extension
3. Right-click `index.html` → "Open with Live Server"

## Data
- **1,211 career pathways** across Bachelor's, Master's, PhD, Diploma, Future, Any Stream
- **259 entrance exams** — Engineering, Medical, Management, Law, Design, Govt Jobs, Certs
- **22 career clusters** with full Class 10 → Class 12 → Graduation eligibility paths

## Tabs
| Tab | Count |
|-----|-------|
| All Pathways | 1,211 |
| Bachelor's | 444 |
| Master's | 451 |
| PhD | 70 |
| Diploma/Cert | 246 |
| Future Careers | 150 |
| Any Stream | 135 |
| Subjects | 31 |
| Streams | 10 |
| All Exams | 259 |

## Filters
**Career tabs:** Stream eligibility, Field/Cluster, Type, Level, Demand, AI risk, Duration, Difficulty, Remote work, Mobility, Govt opportunities, Entrepreneurship, Entry salary, Private sector, India/Global scope, Research component

**Exam tab:** Category, Exam Type, Class 10 Path, Degree Required, Full details toggle
