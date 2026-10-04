#!/usr/bin/env python3
"""Import bibliographic entries from the Archive's original DOCX, never full texts.

Usage: python3 scripts/import-reading-program.py /path/to/1000-Nights-Reading-Program.docx
Download: https://archive.org/download/1000-nights-reading-program/1000-Nights-Reading-Program.docx
"""
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree

root = Path(__file__).resolve().parents[1]
directory = root / "words/1000-night-reading"
source = Path(sys.argv[1])
corrections = json.loads((directory / "source-links.json").read_text())
document = ElementTree.fromstring(zipfile.ZipFile(source).read("word/document.xml"))
paragraphs = document.findall(".//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p")
nights = []
kinds = {"Short Story": "story", "Poem": "poem", "Essay": "essay"}
for paragraph in paragraphs:
    line = "".join(paragraph.itertext()).strip()
    day = re.fullmatch(r"Day (\d+)", line)
    if day:
        nights.append({"night": int(day[1]), "readings": []})
        continue
    if not line.startswith(tuple(f"{kind}:" for kind in kinds)):
        continue
    match = re.fullmatch(r"(Short Story|Poem|Essay):\s*(.+)\s+—\s+(https?://\S+)", line)
    if not match or not nights:
        raise ValueError(f"Could not parse reading: {line}")
    title, author = match[2].rsplit(" — ", 1)
    kind = kinds[match[1]]
    entry = {
        "id": f"{nights[-1]['night']}-{kind}",
        "kind": kind, "title": title.strip(), "author": author.strip(),
        "sourceUrl": match[3], "url": match[3], "verified": False,
    }
    entry.update(corrections.get(f"{title.strip()} — {author.strip()}", {}))
    nights[-1]["readings"].append(entry)

assert [night["night"] for night in nights] == list(range(1, 1001)), "Expected all 1,000 nights"
assert all([entry["kind"] for entry in night["readings"]] == ["story", "poem", "essay"] for night in nights), "Expected three readings every night"
program = {
    "title": "1000 Nights Reading Program",
    "source": "https://archive.org/details/1000-nights-reading-program",
    "download": "https://archive.org/download/1000-nights-reading-program/1000-Nights-Reading-Program.docx",
    "listLicense": "https://creativecommons.org/publicdomain/mark/1.0/",
    "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
    "note": "Bibliographic schedule only. The archive's list marking does not license the linked works. Unverified source links may contain errors.",
    "nights": nights,
}
(directory / "schedule.json").write_text(json.dumps(program, ensure_ascii=False, separators=(",", ":")) + "\n")
print(f"Imported {len(nights)} nights and 3,000 credited readings.")
