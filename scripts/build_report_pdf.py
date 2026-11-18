#!/usr/bin/env python3
import argparse
import html
import pathlib
import subprocess
import tempfile

import mistune


STYLE = """
@page { size: A4; margin: 18mm 16mm; }
body { font-family: Arial, 'DejaVu Sans', sans-serif; color: #172033; font-size: 10.5pt; line-height: 1.5; }
h1 { color: #123a63; font-size: 22pt; border-bottom: 2px solid #2b6cb0; padding-bottom: 8px; }
h2 { color: #174f82; font-size: 15pt; margin-top: 22px; break-after: avoid; }
h3 { color: #255f8f; font-size: 12pt; break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 10px 0 16px; font-size: 9pt; }
th, td { border: 1px solid #9fb3c8; padding: 6px 7px; vertical-align: top; }
th { background: #eaf2f8; color: #123a63; }
tr { break-inside: avoid; }
code { font-family: 'DejaVu Sans Mono', monospace; background: #eef2f6; padding: 1px 3px; }
pre { background: #eef2f6; border-left: 4px solid #2b6cb0; padding: 10px; white-space: pre-wrap; break-inside: avoid; }
blockquote { border-left: 4px solid #d69e2e; background: #fff8e1; margin: 12px 0; padding: 6px 12px; }
a { color: #1a5a96; text-decoration: none; }
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Render a Markdown report to PDF with local Chrome.")
    parser.add_argument("source", type=pathlib.Path)
    parser.add_argument("target", type=pathlib.Path)
    args = parser.parse_args()

    markdown = mistune.create_markdown(plugins=["table"])
    source_text = args.source.read_text(encoding="utf-8")
    body = markdown(source_text)
    title = html.escape(args.source.stem.replace("_", " ").title())
    document = f"""<!doctype html><html lang="vi"><head><meta charset="utf-8">
<title>{title}</title><style>{STYLE}</style></head><body>{body}</body></html>"""

    args.target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="hw05-report-") as temp_dir:
        html_file = pathlib.Path(temp_dir) / "report.html"
        html_file.write_text(document, encoding="utf-8")
        subprocess.run(
            [
                "google-chrome",
                "--headless",
                "--disable-gpu",
                "--no-sandbox",
                "--no-pdf-header-footer",
                f"--print-to-pdf={args.target.resolve()}",
                html_file.resolve().as_uri(),
            ],
            check=True,
        )

    print(f"Created {args.target}")


if __name__ == "__main__":
    main()

