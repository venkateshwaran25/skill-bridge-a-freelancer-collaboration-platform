import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    
    # Widescreen 16:9
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # Modern Friendly Color Palette
    DARK_BLUE = RGBColor(15, 23, 42)      # #0f172a
    NAVY = RGBColor(30, 41, 59)          # #1e293b
    ACCENT_BLUE = RGBColor(37, 99, 235)   # #2563eb
    TEAL = RGBColor(13, 148, 136)        # #0d9488
    WHITE = RGBColor(255, 255, 255)      # #ffffff
    LIGHT_BG = RGBColor(248, 250, 252)   # #f8fafc
    CARD_BG = RGBColor(255, 255, 255)    # #ffffff
    DARK_TEXT = RGBColor(30, 41, 59)     # #1e293b
    BORDER_COLOR = RGBColor(226, 232, 240) # #e2e8f0

    blank_layout = prs.slide_layouts[6]
    
    def add_header(slide, title_text, category_text="SKILLBRIDGE AI"):
        header_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.1))
        header_box.fill.solid()
        header_box.fill.fore_color.rgb = DARK_BLUE
        header_box.line.color.rgb = DARK_BLUE
        
        cat_tf = slide.shapes.add_textbox(Inches(0.8), Inches(0.15), Inches(11), Inches(0.3)).text_frame
        cat_tf.word_wrap = True
        p_cat = cat_tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = TEAL
        
        title_tf = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11), Inches(0.6)).text_frame
        title_tf.word_wrap = True
        p_title = title_tf.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = DARK_BLUE
    bg1.line.color.rgb = DARK_BLUE
    
    accent_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1), Inches(1.2), Inches(11.333), Inches(5.1))
    accent_card.fill.solid()
    accent_card.fill.fore_color.rgb = NAVY
    accent_card.line.color.rgb = ACCENT_BLUE

    tf1 = slide1.shapes.add_textbox(Inches(1.5), Inches(1.6), Inches(10.333), Inches(2.0)).text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "SkillBridge AI"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = WHITE
    
    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Smart Freelancing Platform & Real-Time Team Workplace"
    p1_sub.font.size = Pt(22)
    p1_sub.font.color.rgb = TEAL

    details_tf = slide1.shapes.add_textbox(Inches(1.5), Inches(3.8), Inches(10.333), Inches(2.2)).text_frame
    details_tf.word_wrap = True
    
    details_data = [
        ("Student Name:", "Your Name (Reg No: XXXXXXXX)"),
        ("Project Guide:", "Guide Name"),
        ("Department:", "Computer Science & Engineering"),
        ("Built With:", "React, Node.js, Express, MongoDB, Socket.io, Gemini AI")
    ]
    
    for label, val in details_data:
        p = details_tf.add_paragraph()
        p.text = f"{label:<18} {val}"
        p.font.size = Pt(14)
        p.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 2: INTRODUCTION (Simple Words)
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "What is SkillBridge AI?", "INTRODUCTION")
    
    bg2 = slide2.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.1), Inches(13.333), Inches(6.4))
    bg2.fill.solid()
    bg2.fill.fore_color.rgb = LIGHT_BG
    bg2.line.color.rgb = LIGHT_BG
    
    cards_data = [
        ("Simple All-In-One Platform", "SkillBridge connects clients who need work done with freelancers who have the right skills, all in one easy website."),
        ("Smart AI Assistance", "Google Gemini AI helps write clear project details, estimates realistic budgets, and creates proposal pitches in seconds."),
        ("Shared Workspace", "Once a client accepts a bid, a private digital workspace is created automatically so both can manage tasks together."),
        ("Real-Time Chat & Updates", "Built-in live chat lets clients and freelancers message each other instantly and see task updates live on their screens.")
    ]
    
    positions = [
        (Inches(0.8), Inches(1.5)), (Inches(6.8), Inches(1.5)),
        (Inches(0.8), Inches(4.2)), (Inches(6.8), Inches(4.2))
    ]
    
    for i, (title, desc) in enumerate(cards_data):
        left, top = positions[i]
        card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.7), Inches(2.4))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = ACCENT_BLUE
        
        tf = slide2.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), Inches(5.3), Inches(2.0)).text_frame
        tf.word_wrap = True
        
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(18)
        p_t.font.bold = True
        p_t.font.color.rgb = DARK_BLUE
        
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 3: PROBLEM STATEMENT (Human Language)
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Real Problems in Freelancing Today", "PROBLEM STATEMENT")
    
    bg3 = slide3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.1), Inches(13.333), Inches(6.4))
    bg3.fill.solid()
    bg3.fill.fore_color.rgb = LIGHT_BG
    bg3.line.color.rgb = LIGHT_BG

    problems = [
        ("Hard to Find the Right Talent", "Clients waste hours reading through hundreds of bids without knowing who is best."),
        ("Hard to Write Clear Job Details", "Non-technical clients don't know how to explain what they need, causing confusion later."),
        ("Guessing Budgets & Timelines", "Without clear guides, clients often guess wrong prices, leading to budget problems."),
        ("Writing Proposals Takes Too Long", "Freelancers spend hours writing cover letters over and over for every single job."),
        ("Work is Scattered Everywhere", "Hiring is done on one site, but work happens on Slack, WhatsApp, Trello, and email."),
        ("No Easy Way to Track Progress", "Clients cannot see daily task progress easily and only find out about delays when it's too late.")
    ]

    for i, (title, desc) in enumerate(problems):
        row = i // 2
        col = i % 2
        left = Inches(0.8) if col == 0 else Inches(6.8)
        top = Inches(1.4) + Inches(row * 1.8)
        
        card = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.7), Inches(1.6))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        
        tf = slide3.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), Inches(5.3), Inches(1.3)).text_frame
        tf.word_wrap = True
        
        p_t = tf.paragraphs[0]
        p_t.text = f"❌ {title}"
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = RGBColor(220, 38, 38)
        
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 4: OBJECTIVES (Simple Goals)
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "What We Want to Achieve", "OUR GOALS")
    
    bg4 = slide4.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.1), Inches(13.333), Inches(6.4))
    bg4.fill.solid()
    bg4.fill.fore_color.rgb = LIGHT_BG
    bg4.line.color.rgb = LIGHT_BG

    objectives = [
        "🎯 Connect Clients & Freelancers in one simple, clean platform.",
        "🎯 AI Candidate Match: Use Gemini AI to automatically find and rank the best freelancers for a job.",
        "🎯 AI Project Helper: Let AI improve project descriptions so requirements are crystal clear.",
        "🎯 AI Budget Estimator: Give accurate price ranges and estimated completion hours before posting.",
        "🎯 AI Proposal Generator: Help freelancers write great cover letters with a single click.",
        "🎯 Instant Digital Workspace: Automatically open a private task board as soon as a proposal is accepted.",
        "🎯 Real-Time Chat & Tasks: Allow instant messaging and drag-and-drop task tracking.",
        "🎯 AI Progress Reports: Automatically detect delayed tasks and generate easy-to-read progress reports."
    ]

    for i, obj in enumerate(objectives):
        top = Inches(1.3) + Inches(i * 0.70)
        card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, Inches(11.733), Inches(0.62))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = ACCENT_BLUE
        
        tf = slide4.shapes.add_textbox(Inches(1.0), top + Inches(0.08), Inches(11.333), Inches(0.45)).text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = obj
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = DARK_BLUE

    # ==========================================
    # SLIDE 5: MODULES (Clear Divisions)
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Main Parts of the System", "PROJECT MODULES")
    
    bg5 = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.1), Inches(13.333), Inches(6.4))
    bg5.fill.solid()
    bg5.fill.fore_color.rgb = LIGHT_BG
    bg5.line.color.rgb = LIGHT_BG

    modules_data = [
        ("CLIENT FEATURES", ACCENT_BLUE, ["Client Dashboard", "Post New Job", "AI Description Helper", "AI Budget Estimator", "Freelancer Matcher", "Project Tracker"]),
        ("FREELANCER FEATURES", TEAL, ["Freelancer Dashboard", "Browse All Jobs", "Apply & Send Bids", "My Projects List", "Portfolio Page", "Workspace Area"]),
        ("COMMON FEATURES", DARK_BLUE, ["Easy Login & Register", "Profile Page", "Live Chat Messaging", "Instant Alerts", "Payment History", "Star Ratings"]),
        ("AI FEATURES", RGBColor(147, 51, 234), ["Gemini AI Core", "Candidate Matcher", "Proposal Generator", "Job Description Fixer", "Budget Estimator", "AI Progress Reports"])
    ]

    for i, (m_title, m_color, m_items) in enumerate(modules_data):
        left = Inches(0.8) + Inches(i * 2.95)
        card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.4), Inches(2.8), Inches(5.4))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = m_color
        
        header = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.4), Inches(2.8), Inches(0.7))
        header.fill.solid()
        header.fill.fore_color.rgb = m_color
        header.line.color.rgb = m_color
        
        htf = slide5.shapes.add_textbox(left, Inches(1.5), Inches(2.8), Inches(0.5)).text_frame
        htf.word_wrap = True
        hp = htf.paragraphs[0]
        hp.text = m_title
        hp.alignment = PP_ALIGN.CENTER
        hp.font.size = Pt(13)
        hp.font.bold = True
        hp.font.color.rgb = WHITE
        
        tf = slide5.shapes.add_textbox(left + Inches(0.15), Inches(2.2), Inches(2.5), Inches(4.5)).text_frame
        tf.word_wrap = True
        
        for item in m_items:
            p = tf.add_paragraph()
            p.text = f"✔ {item}"
            p.font.size = Pt(12)
            p.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 6: TESTING TABLE (Review III)
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Testing & Verification Table", "TESTING RESULTS")
    
    bg6 = slide6.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.1), Inches(13.333), Inches(6.4))
    bg6.fill.solid()
    bg6.fill.fore_color.rgb = LIGHT_BG
    bg6.line.color.rgb = LIGHT_BG

    rows, cols = 10, 5
    table_shape = slide6.shapes.add_table(rows, cols, Inches(0.8), Inches(1.3), Inches(11.733), Inches(5.6))
    table = table_shape.table
    
    col_widths = [Inches(2.2), Inches(2.4), Inches(2.4), Inches(3.3), Inches(1.433)]
    for i, w in enumerate(col_widths):
        table.columns[i].width = w

    headers = ["Test Case", "Input", "Expected Output", "Actual Output", "Status"]
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = DARK_BLUE
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = WHITE

    test_data = [
        ("User Registration", "Valid user details", "Account created", "Account created", "PASS"),
        ("User Login", "Valid email & password", "Dashboard displayed", "Dashboard displayed", "PASS"),
        ("Create Project", "Project details", "Project created", "Project created", "PASS"),
        ("AI Description", "Draft description", "Improved description", "Improved description", "PASS"),
        ("AI Budget Estimator", "Project requirements", "Estimated budget", "Estimated budget", "PASS"),
        ("Freelancer Match", "Skill requirements", "Matching freelancers", "Matching freelancers", "PASS"),
        ("Proposal Generation", "Project details", "AI proposal", "AI proposal", "PASS"),
        ("Accept Proposal", "Click Accept Bid", "Workplace opened", "Workplace opened", "PASS"),
        ("Live Chat", "Message text / file", "Message delivered", "Message delivered", "PASS")
    ]

    for row_idx, data in enumerate(test_data, start=1):
        for col_idx, text in enumerate(data):
            cell = table.cell(row_idx, col_idx)
            cell.text = text
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(10)
            if col_idx == 4:
                p.font.bold = True
                p.font.color.rgb = RGBColor(22, 163, 74)
            else:
                p.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 7: LIVE DEMO WORKFLOW (Simple 12 Steps)
    # ==========================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "How the Live Demo Works", "DEMO STEPS")
    
    bg7 = slide7.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.1), Inches(13.333), Inches(6.4))
    bg7.fill.solid()
    bg7.fill.fore_color.rgb = LIGHT_BG
    bg7.line.color.rgb = LIGHT_BG

    steps = [
        ("Step 1", "Register / Login as Client"),
        ("Step 2", "Client creates a project"),
        ("Step 3", "Use AI Description Optimizer"),
        ("Step 4", "Use AI Budget Estimator"),
        ("Step 5", "View suitable freelancers with AI"),
        ("Step 6", "Login as Freelancer"),
        ("Step 7", "Freelancer views project"),
        ("Step 8", "Generate & send AI proposal"),
        ("Step 9", "Client accepts freelancer"),
        ("Step 10", "Open Digital Workspace"),
        ("Step 11", "Create & drag tasks on board"),
        ("Step 12", "Show live chat & AI report")
    ]

    for i, (num, label) in enumerate(steps):
        row = i // 3
        col = i % 3
        left = Inches(0.8) + Inches(col * 3.95)
        top = Inches(1.4) + Inches(row * 1.35)
        
        card = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(3.7), Inches(1.15))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = ACCENT_BLUE
        
        tf = slide7.shapes.add_textbox(left + Inches(0.1), top + Inches(0.1), Inches(3.5), Inches(0.95)).text_frame
        tf.word_wrap = True
        
        p_num = tf.paragraphs[0]
        p_num.text = num
        p_num.font.size = Pt(12)
        p_num.font.bold = True
        p_num.font.color.rgb = TEAL
        
        p_lbl = tf.add_paragraph()
        p_lbl.text = label
        p_lbl.font.size = Pt(12)
        p_lbl.font.bold = True
        p_lbl.font.color.rgb = DARK_BLUE

    # ==========================================
    # SLIDE 8: INPUT & OUTPUT SCREENS
    # ==========================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Inputs vs Outputs Overview", "SCREENS SUMMARY")
    
    bg8 = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.1), Inches(13.333), Inches(6.4))
    bg8.fill.solid()
    bg8.fill.fore_color.rgb = LIGHT_BG
    bg8.line.color.rgb = LIGHT_BG

    screens_mapping = [
        ("INPUT SCREENS (What User Enters)", [
            "Registration: Name, Email, Password, Role, Skills",
            "Create Project: Title, Description, Skills, Budget",
            "AI Prompt Input: Enter basic project requirements",
            "Proposal Bid: Cover letter, Price quote, Delivery time",
            "Task Form: Title, Assignee, Priority level, Due date"
        ]),
        ("OUTPUT SCREENS (What System Produces)", [
            "AI Description: Clear, improved, structured description",
            "AI Budget: Estimated budget range & completion hours",
            "AI Freelancer Match: Ranked candidates with match %",
            "Digital Workspace: Real-time task board & live chat",
            "AI Progress Report: Natural summary & risk warnings"
        ])
    ]

    for i, (title, items) in enumerate(screens_mapping):
        left = Inches(0.8) if i == 0 else Inches(6.8)
        card = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.4), Inches(5.7), Inches(5.4))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = ACCENT_BLUE if i == 0 else TEAL
        
        h = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.4), Inches(5.7), Inches(0.7))
        h.fill.solid()
        h.fill.fore_color.rgb = ACCENT_BLUE if i == 0 else TEAL
        h.line.color.rgb = ACCENT_BLUE if i == 0 else TEAL
        
        htf = slide8.shapes.add_textbox(left, Inches(1.5), Inches(5.7), Inches(0.5)).text_frame
        hp = htf.paragraphs[0]
        hp.text = title
        hp.alignment = PP_ALIGN.CENTER
        hp.font.size = Pt(16)
        hp.font.bold = True
        hp.font.color.rgb = WHITE
        
        tf = slide8.shapes.add_textbox(left + Inches(0.2), Inches(2.3), Inches(5.3), Inches(4.3)).text_frame
        tf.word_wrap = True
        
        for item in items:
            p = tf.add_paragraph()
            p.text = f"✔  {item}"
            p.font.size = Pt(13)
            p.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 9: CONCLUSION
    # ==========================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "Conclusion & What's Next", "CONCLUSION")
    
    bg9 = slide9.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.1), Inches(13.333), Inches(6.4))
    bg9.fill.solid()
    bg9.fill.fore_color.rgb = LIGHT_BG
    bg9.line.color.rgb = LIGHT_BG

    c_box = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.7), Inches(5.4))
    c_box.fill.solid()
    c_box.fill.fore_color.rgb = CARD_BG
    c_box.line.color.rgb = ACCENT_BLUE
    
    c_tf = slide9.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(5.3), Inches(5.0)).text_frame
    c_tf.word_wrap = True
    cp1 = c_tf.paragraphs[0]
    cp1.text = "WHAT WE BUILT"
    cp1.font.size = Pt(16)
    cp1.font.bold = True
    cp1.font.color.rgb = ACCENT_BLUE
    
    c_bullets = [
        "A complete freelancing platform connecting clients & freelancers.",
        "Integrated AI features that save time for both clients & freelancers.",
        "Automatic digital workspace for task management & live chat.",
        "100% verified testing results for Review III."
    ]
    for b in c_bullets:
        p = c_tf.add_paragraph()
        p.text = f"• {b}"
        p.font.size = Pt(13)
        p.font.color.rgb = DARK_TEXT

    f_box = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.4))
    f_box.fill.solid()
    f_box.fill.fore_color.rgb = CARD_BG
    f_box.line.color.rgb = TEAL
    
    f_tf = slide9.shapes.add_textbox(Inches(7.0), Inches(1.6), Inches(5.3), Inches(5.0)).text_frame
    f_tf.word_wrap = True
    fp1 = f_tf.paragraphs[0]
    fp1.text = "FUTURE GOALS"
    fp1.font.size = Pt(16)
    fp1.font.bold = True
    fp1.font.color.rgb = TEAL
    
    f_bullets = [
        "Smart Contract Payments: Automatic milestone releases using blockchain.",
        "AI Code Review: Automatically check code quality when freelancers upload files.",
        "Video Meetings: Add built-in HD video calls inside the workspace.",
        "Mobile App: Build mobile app versions for Android & iOS."
    ]
    for b in f_bullets:
        p = f_tf.add_paragraph()
        p.text = f"• {b}"
        p.font.size = Pt(13)
        p.font.color.rgb = DARK_TEXT

    # ==========================================
    # SLIDE 10: THANK YOU
    # ==========================================
    slide10 = prs.slides.add_slide(blank_layout)
    bg10 = slide10.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg10.fill.solid()
    bg10.fill.fore_color.rgb = DARK_BLUE
    bg10.line.color.rgb = DARK_BLUE

    tf10 = slide10.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.333), Inches(3.0)).text_frame
    tf10.word_wrap = True
    
    p10 = tf10.paragraphs[0]
    p10.text = "THANK YOU!"
    p10.alignment = PP_ALIGN.CENTER
    p10.font.size = Pt(54)
    p10.font.bold = True
    p10.font.color.rgb = WHITE
    
    p10_sub = tf10.add_paragraph()
    p10_sub.text = "Any Questions or Feedback?"
    p10_sub.alignment = PP_ALIGN.CENTER
    p10_sub.font.size = Pt(22)
    p10_sub.font.color.rgb = TEAL

    try:
        output_filename = "SkillBridge_AI_Presentation_Simple.pptx"
        prs.save(output_filename)
        print(f"Successfully generated {output_filename}")
    except Exception:
        output_filename = "SkillBridge_AI_Presentation_V2.pptx"
        prs.save(output_filename)
        print(f"Successfully generated {output_filename}")

if __name__ == "__main__":
    create_presentation()
