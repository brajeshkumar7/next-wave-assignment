from xml.sax.saxutils import escape
from docx import Document
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether

DOCX = r"D:\nextwave\output\Layer_2_Parent_Decision_Brief.docx"
PDF = r"D:\nextwave\output\Layer_2_Parent_Decision_Brief.pdf"
docx = Document(DOCX)

styles = {
    "Title": ParagraphStyle("Title", fontName="Helvetica-Bold", fontSize=20.5, leading=24,
                            textColor=colors.black, spaceAfter=4),
    "Subtitle": ParagraphStyle("Subtitle", fontName="Helvetica-Bold", fontSize=9.4, leading=12,
                               textColor=colors.HexColor("#4B535B"), spaceAfter=11),
    "Heading 2": ParagraphStyle("Heading 2", fontName="Helvetica-Bold", fontSize=11.2, leading=14,
                                textColor=colors.black, spaceBefore=9, spaceAfter=3),
    "Normal": ParagraphStyle("Normal", fontName="Helvetica", fontSize=10.2, leading=13.1,
                             textColor=colors.HexColor("#181E24"), spaceAfter=6, alignment=TA_LEFT),
    "Source Line": ParagraphStyle("Source Line", fontName="Helvetica", fontSize=8.3, leading=11,
                                  textColor=colors.HexColor("#50575F"), spaceBefore=7),
}

story = []
for i, p in enumerate(docx.paragraphs):
    if not p.text.strip():
        continue
    style = p.style.name
    if i == 1:
        style = "Subtitle"
    if style == "Source Line":
        body = ('Public evidence: '
                '<link href="https://apply.niatindia.com/login-gnc/" color="#19548A"><u>NIAT admissions and FAQ</u></link>'
                '  |  '
                '<link href="https://www.niatindia.com/llm-info" color="#19548A"><u>NIAT program and degree facts</u></link>')
    else:
        body = escape(p.text)
    story.append(Paragraph(body, styles.get(style, styles["Normal"])))

pdf = SimpleDocTemplate(PDF, pagesize=A4, rightMargin=0.84*inch, leftMargin=0.84*inch,
                        topMargin=0.76*inch, bottomMargin=0.70*inch,
                        title="NIAT Parent Decision Brief", author="")
pdf.build(story)
print(PDF)
