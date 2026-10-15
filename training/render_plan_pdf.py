"""Render training/periodisation-plan.md to PDF (ReportLab).

Usage: uvx --with reportlab python training/render_plan_pdf.py training/periodisation-plan.md training/periodisation-plan.pdf "<header text>"
"""
import re
import sys
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

SRC, OUT, HEADER = sys.argv[1], sys.argv[2], sys.argv[3]

ss = getSampleStyleSheet()
body = ParagraphStyle("body", parent=ss["BodyText"], fontName="Helvetica", fontSize=9, leading=12.2, spaceAfter=5, alignment=TA_LEFT)
h1 = ParagraphStyle("h1", parent=body, fontName="Helvetica-Bold", fontSize=17, leading=21, spaceBefore=4, spaceAfter=8)
h2 = ParagraphStyle("h2", parent=body, fontName="Helvetica-Bold", fontSize=13, leading=16, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor("#1f3a5f"))
h3 = ParagraphStyle("h3", parent=body, fontName="Helvetica-Bold", fontSize=10.5, leading=13.5, spaceBefore=9, spaceAfter=4)
cell = ParagraphStyle("cell", parent=body, fontSize=7.6, leading=9.6, spaceAfter=0)
cellh = ParagraphStyle("cellh", parent=cell, fontName="Helvetica-Bold")
ref = ParagraphStyle("ref", parent=body, fontSize=7.8, leading=10, spaceAfter=2.5, leftIndent=12, firstLineIndent=-12)


def inline(t):
    t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<i>\1</i>", t)
    t = re.sub(r"`(.+?)`", r'<font face="Courier">\1</font>', t)
    return t


def cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def table(rows, width):
    header, data = rows[0], [r for r in rows[1:] if not re.fullmatch(r"[\s:\-|]+", "|".join(r))]
    ncol = len(header)
    data = [r + [""] * (ncol - len(r)) for r in data]
    lens = [max(len(r[i]) for r in [header] + data) for i in range(ncol)]
    weights = [min(max(l, 9), 60) for l in lens]
    total = sum(weights)
    widths = [width * w / total for w in weights]
    tdata = [[Paragraph(inline(c), cellh) for c in header]] + [[Paragraph(inline(c), cell) for c in r] for r in data]
    t = Table(tdata, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eef5")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b8c4d2")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
    ]))
    return t


def build():
    doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=17 * mm, rightMargin=17 * mm, topMargin=18 * mm, bottomMargin=16 * mm,
                            title="Decade Periodisation Plan 2026-2036 (annotated)", author="Project Ironman")
    width = A4[0] - 34 * mm
    lines = open(SRC, encoding="utf-8").read().split("\n")
    story, para, i = [], [], 0

    def flush():
        if para:
            story.append(Paragraph(inline(" ".join(para)), body))
            para.clear()

    while i < len(lines):
        ln = lines[i]
        if ln.startswith("|"):
            flush()
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append(cells(lines[i]))
                i += 1
            story.append(table(rows, width))
            story.append(Spacer(1, 6))
            continue
        if ln.startswith("# "):
            flush(); story.append(Paragraph(inline(ln[2:]), h1))
        elif ln.startswith("## "):
            flush(); story.append(Paragraph(inline(ln[3:]), h2))
        elif ln.startswith("### "):
            flush(); story.append(Paragraph(inline(ln[4:]), h3))
        elif re.match(r"^\d+\. ", ln):
            flush(); story.append(Paragraph(inline(ln), ref))
        elif not ln.strip():
            flush()
        else:
            para.append(ln.strip())
        i += 1
    flush()

    def deco(canvas, doc_):
        canvas.saveState()
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(colors.HexColor("#555555"))
        canvas.drawString(17 * mm, A4[1] - 11 * mm, HEADER)
        canvas.drawRightString(A4[0] - 17 * mm, 9 * mm, f"Page {doc_.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=deco, onLaterPages=deco)


build()
print("wrote", OUT)
