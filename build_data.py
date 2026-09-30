"""Builds site/data/fall-2026.js from the researched reading JSON plus course metadata.
To add a new quarter: copy this block, point READINGS at the new JSON files, run again."""
import json, pathlib

ROOT = pathlib.Path(__file__).parent
readings = []
for f in ["mfjs4160.json", "mfjs4650.json"]:
    readings += json.load(open(ROOT / "data" / f))

for r in readings:
    if r["id"].startswith("massey"):  # archive page has no confirmed full text
        r["read_url"] = None
        r["access"] = "book"
    for k in ("summary", "analysis", "apa", "title", "note"):
        if r.get(k):
            assert "—" not in r[k] and "–" not in r[k], (r["id"], k)

quarter = {
    "id": "fall-2026",
    "label": "Fall Quarter 2026",
    "start": "2026-09-08",
    "end": "2026-11-20",
    "program": "M.A. Media and Globalization, Public Diplomacy certificate",
    "courses": [
        {
            "code": "MFJS 4160",
            "slug": "mfjs4160",
            "title": "Media Theories",
            "instructor": "Dr. Rachael Liberman",
            "text": "Baran & Davis, Mass Communication Theory (8th ed.)",
            "description": "Mass communication theory in the order it was argued: mass society, limited effects, the critical cultural turn, and meaning making, tested against platforms, data, and identity.",
            "milestones": [
                ["2026-10-05", "Theory profile essay"],
                ["2026-10-28", "Application essay"],
                ["2026-11-16", "Peer review"],
                ["2026-11-18", "Theoretical framework"],
            ],
        },
        {
            "code": "MFJS 4650",
            "slug": "mfjs4650",
            "title": "Global Media and Communication",
            "instructor": "Dr. Erika Polson",
            "text": "Regional focus: Eastern Europe",
            "description": "How media moves across borders: imperial networks and news agencies, the cultural imperialism debates, globalization and deterritorialization, streaming, and platform power.",
            "milestones": [
                ["2026-09-28", "Western Europe case study"],
                ["2026-10-14", "Midterm"],
                ["2026-10-19", "Debate"],
                ["2026-11-04", "Eastern Europe case study"],
                ["2026-11-19", "Position paper"],
            ],
        },
    ],
    "deepDives": [
        {
            "title": "From mass society to libertarian theory",
            "status": "In progress",
            "course": "MFJS 4160",
            "due": "2026-10-05",
            "summary": "A theory profile tracing mass society thinking into libertarian press theory and the self-righting principle, following both through each paradigm shift and into current generational research for and against them.",
            "sources": ["Milton (1644)", "Lippmann (1922)", "Keane (1991)", "Napoli (1999)", "Adams-Bloom & Cleary (2009)"],
        },
        {
            "title": "How algorithms classify people, 1841 to 2026",
            "status": "Synthesis complete",
            "course": "Independent research",
            "due": None,
            "summary": "Four eras of sorting people: actuarial and geodemographic clusters, collaborative filtering, footprint inference, and embeddings with generative recommenders. Classification moved from declared, to inferred, to implicit.",
            "sources": ["Cheney-Lippold (2011)", "Kosinski et al. (2013)", "Fourcade & Healy (2017)"],
        },
        {
            "title": "Culture as window dressing: Netflix and locality",
            "status": "Presented Sep 28",
            "course": "MFJS 4650",
            "due": None,
            "summary": "Western Europe case study on Idiz et al. (2025), read through Tomlinson on deterritorialization and Appadurai's five scapes, with the Dutch streaming investment obligation as the policy sequel.",
            "sources": ["Idiz et al. (2025)", "Tomlinson (1999)", "Appadurai (1990)", "Hamelink (1983)"],
        },
        {
            "title": "Eastern Europe: public diplomacy and soft power",
            "status": "Starting",
            "course": "MFJS 4650",
            "due": "2026-11-04",
            "summary": "Cold war propaganda and free flow, post-1989 media privatization, media capture, and platform governance under the Digital Services Act, building toward the regional case study and the final position paper.",
            "sources": ["Thussu (2019)", "Entman (1993)", "Helberg (2021)"],
        },
        {
            "title": "Thesis concept: classifying relationships",
            "status": "In development",
            "course": "Master's thesis",
            "due": None,
            "summary": "Building a research database of professional relationships while theorizing what classification does to the people it sorts. The guard rules on automated profiling are where the tool and the critique meet.",
            "sources": ["Cheney-Lippold (2011)", "Fourcade & Healy (2017)", "Couldry & Mejias (2019)"],
        },
    ],
    "readings": readings,
}

out = ROOT / "site" / "data"
out.mkdir(parents=True, exist_ok=True)
js = "window.QUARTERS = window.QUARTERS || [];\nwindow.QUARTERS.push(" + json.dumps(quarter, ensure_ascii=True, separators=(",", ":")) + ");\n"
(out / "fall-2026.js").write_text(js)
print(len(readings), "readings ->", out / "fall-2026.js")
