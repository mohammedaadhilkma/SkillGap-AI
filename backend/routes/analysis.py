from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from services.pdf_parser import extract_text_from_pdf
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


# ── Rich job role dataset ──────────────────────────────────────────────────────
MOCK_ROLES = {
    "Cloud Architect": {
        "skills": ["AWS", "Azure", "Kubernetes", "Docker", "Terraform", "System Design", "Networking", "Security"],
        "courses": {
            "AWS": ("AWS Solutions Architect – freeCodeCamp", "https://www.youtube.com/watch?v=Ia-UEYYRCEI"),
            "Azure": ("Azure Fundamentals – freeCodeCamp", "https://www.youtube.com/watch?v=NKEFWy4RV5Q"),
            "Kubernetes": ("Kubernetes Full Course – TechWorld Nana", "https://www.youtube.com/watch?v=X48VuDVv0do"),
            "Docker": ("Docker Tutorial – TechWorld Nana", "https://www.youtube.com/watch?v=3c-iBn73dDE"),
            "Terraform": ("Terraform for Beginners – freeCodeCamp", "https://www.youtube.com/watch?v=SLB_c_ayRMo"),
            "System Design": ("System Design Interview – YouTube", "https://www.youtube.com/results?search_query=system+design+interview"),
            "Networking": ("Networking Basics – Udemy", "https://www.udemy.com/"),
            "Security": ("Cloud Security – Coursera", "https://www.coursera.org/"),
        },
    },
    "Full Stack Developer": {
        "skills": ["JavaScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Git", "REST APIs", "TypeScript", "Docker"],
        "courses": {
            "JavaScript": ("JavaScript Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=PkZNo7MFNFg"),
            "React": ("React Full Course – Scrimba", "https://scrimba.com/learn/learnreact"),
            "Node.js": ("Node.js Crash Course – Traversy Media", "https://www.youtube.com/watch?v=fBNz5xF-Kx4"),
            "Express": ("Express.js Tutorial – freeCodeCamp", "https://www.youtube.com/watch?v=L72fhGm1tfE"),
            "MongoDB": ("MongoDB Tutorial – freeCodeCamp", "https://www.youtube.com/watch?v=c2M-rlkkT5o"),
            "SQL": ("SQL Tutorial – Codecademy", "https://www.codecademy.com/learn/learn-sql"),
            "Git": ("Git & GitHub – freeCodeCamp", "https://www.youtube.com/watch?v=RGOj5yH7evk"),
            "REST APIs": ("REST API Tutorial – YouTube", "https://www.youtube.com/watch?v=0sOvCWFmrtA"),
            "TypeScript": ("TypeScript Full Course – Fireship", "https://www.youtube.com/watch?v=SpwzRDUQ1GI"),
            "Docker": ("Docker Crash Course – YouTube", "https://www.youtube.com/watch?v=3c-iBn73dDE"),
        },
    },
    "QA Engineer": {
        "skills": ["Manual Testing", "Selenium", "Cypress", "Appium", "JUnit", "TestNG", "Postman", "CI/CD"],
        "courses": {
            "Manual Testing": ("Software Testing Basics – YouTube", "https://www.youtube.com/results?search_query=software+testing+basics"),
            "Selenium": ("Selenium Webdriver – freeCodeCamp", "https://www.youtube.com/results?search_query=selenium+webdriver"),
            "Cypress": ("Cypress Tutorial – freeCodeCamp", "https://www.youtube.com/watch?v=7N63cKFWMUY"),
            "Appium": ("Appium Mobile Testing – YouTube", "https://www.youtube.com/results?search_query=appium+tutorial"),
            "JUnit": ("JUnit Tutorial – YouTube", "https://www.youtube.com/results?search_query=junit+tutorial"),
            "TestNG": ("TestNG Tutorial – YouTube", "https://www.youtube.com/results?search_query=testng+tutorial"),
            "Postman": ("API Testing with Postman – freeCodeCamp", "https://www.youtube.com/watch?v=VywxIQ2ZXw4"),
            "CI/CD": ("Jenkins CI/CD – TechWorld Nana", "https://www.youtube.com/watch?v=FX322RVNGj4"),
        },
    },
    "Database Administrator": {
        "skills": ["SQL", "PostgreSQL", "MySQL", "Oracle", "MongoDB", "Database Tuning", "Backup/Recovery", "Linux"],
        "courses": {
             "SQL": ("SQL Course – freeCodeCamp", "https://www.youtube.com/watch?v=HXV3zeQKqGY"),
             "PostgreSQL": ("PostgreSQL Tutorial – freeCodeCamp", "https://www.youtube.com/watch?v=qw--VYLpxG4"),
             "MySQL": ("MySQL Crash Course – Traversy Media", "https://www.youtube.com/watch?v=9ylj9nr0Lcg"),
             "Oracle": ("Oracle Database – YouTube", "https://www.youtube.com/results?search_query=oracle+database+tutorial"),
             "MongoDB": ("MongoDB Tutorial – freeCodeCamp", "https://www.youtube.com/watch?v=c2M-rlkkT5o"),
             "Database Tuning": ("SQL Performance Tuning – YouTube", "https://www.youtube.com/results?search_query=sql+performance+tuning"),
             "Backup/Recovery": ("DB Backup strategies – Udemy", "https://www.udemy.com/"),
             "Linux": ("Linux Fundamentals – freeCodeCamp", "https://www.youtube.com/watch?v=ZtqBQ68cfJc"),
        },
    },
    "Blockchain Developer": {
        "skills": ["Solidity", "Web3.js", "Ethers.js", "Smart Contracts", "Cryptography", "Ethereum", "Rust"],
        "courses": {
            "Solidity": ("Solidity Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=gyMwXuJrbJQ"),
            "Web3.js": ("Web3.js Tutorial – YouTube", "https://www.youtube.com/results?search_query=web3.js+tutorial"),
            "Ethers.js": ("Ethers.js Tutorial – YouTube", "https://www.youtube.com/results?search_query=ethers.js+tutorial"),
            "Smart Contracts": ("Smart Contract Development – freeCodeCamp", "https://www.youtube.com/watch?v=M576WGiDBdQ"),
            "Cryptography": ("Cryptography for Blockchain – YouTube", "https://www.youtube.com/results?search_query=blockchain+cryptography"),
            "Ethereum": ("Ethereum Basics – YouTube", "https://www.youtube.com/results?search_query=ethereum+basics"),
            "Rust": ("Rust Crash Course – Traversy Media", "https://www.youtube.com/watch?v=zF34dRivLOw"),
        },
    },
    "Network Engineer": {
        "skills": ["Routing/Switching", "TCP/IP", "Cisco CCNA", "Firewalls", "Wireshark", "Network Security", "Linux", "Python"],
        "courses": {
            "Routing/Switching": ("Networking Fundamentals – freeCodeCamp", "https://www.youtube.com/watch?v=qiQR5rTSshw"),
            "TCP/IP": ("TCP/IP Model Explained – YouTube", "https://www.youtube.com/results?search_query=tcp+ip+model"),
            "Cisco CCNA": ("CCNA 200-301 – YouTube", "https://www.youtube.com/results?search_query=cisco+ccna"),
            "Firewalls": ("Firewall Basics – YouTube", "https://www.youtube.com/results?search_query=firewall+basics"),
            "Wireshark": ("Wireshark Tutorial – freeCodeCamp", "https://www.youtube.com/watch?v=lb1Dw0elwHQ"),
            "Network Security": ("Network Security basics – Coursera", "https://www.coursera.org/"),
            "Linux": ("Linux Networking – YouTube", "https://www.youtube.com/results?search_query=linux+networking"),
            "Python": ("Python for Network Engineers – YouTube", "https://www.youtube.com/results?search_query=python+for+network+engineers"),
        },
    },
    "Data Scientist": {
        "skills": ["Python", "SQL", "Machine Learning", "Statistics", "Pandas", "NumPy", "TensorFlow", "Data Visualization"],
        "courses": {
            "Python":               ("Python for Everybody – Coursera", "https://www.coursera.org/specializations/python"),
            "SQL":                  ("SQL for Data Science – Coursera", "https://www.coursera.org/learn/sql-for-data-science"),
            "Machine Learning":     ("Machine Learning Specialization – Andrew Ng", "https://www.coursera.org/specializations/machine-learning-introduction"),
            "Statistics":           ("Statistics with Python – Coursera", "https://www.coursera.org/specializations/statistics-with-python"),
            "Pandas":               ("Pandas Tutorial – YouTube (Keith Galli)", "https://www.youtube.com/watch?v=vmEHCJofslg"),
            "NumPy":                ("NumPy Full Course – YouTube", "https://www.youtube.com/watch?v=QUT1VHiLmmI"),
            "TensorFlow":           ("TensorFlow Developer Certificate – Coursera", "https://www.coursera.org/professional-certificates/tensorflow-in-practice"),
            "Data Visualization":   ("Data Visualization with Python – Coursera", "https://www.coursera.org/learn/python-for-data-visualization"),
        },
    },
    "Web Developer": {
        "skills": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Git", "REST APIs", "TypeScript"],
        "courses": {
            "HTML":        ("HTML Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=kUMe1FH4CHE"),
            "CSS":         ("CSS Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=OXGznpKZ_sA"),
            "JavaScript":  ("JavaScript Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=PkZNo7MFNFg"),
            "React":       ("React Full Course – Scrimba", "https://scrimba.com/learn/learnreact"),
            "Node.js":     ("Node.js Crash Course – Traversy Media", "https://www.youtube.com/watch?v=fBNz5xF-Kx4"),
            "Git":         ("Git & GitHub – freeCodeCamp", "https://www.youtube.com/watch?v=RGOj5yH7evk"),
            "REST APIs":   ("REST API Tutorial – freeCodeCamp", "https://www.youtube.com/watch?v=0sOvCWFmrtA"),
            "TypeScript":  ("TypeScript Full Course – Fireship", "https://www.youtube.com/watch?v=SpwzRDUQ1GI"),
        },
    },
    "AI Engineer": {
        "skills": ["Python", "PyTorch", "Deep Learning", "Transformers", "MLOps", "NLP", "LangChain", "Vector Databases"],
        "courses": {
            "Python":            ("Python for AI – fast.ai", "https://course.fast.ai"),
            "PyTorch":           ("PyTorch Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=GIsg-ZUy0MY"),
            "Deep Learning":     ("Deep Learning Specialization – Coursera", "https://www.coursera.org/specializations/deep-learning"),
            "Transformers":      ("Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course"),
            "MLOps":             ("MLOps Specialization – Coursera", "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops"),
            "NLP":               ("NLP with Python – YouTube", "https://www.youtube.com/watch?v=X2vAabgKiuM"),
            "LangChain":         ("LangChain Crash Course – YouTube", "https://www.youtube.com/watch?v=LbT1yp6quS8"),
            "Vector Databases":  ("Vector DBs Explained – YouTube", "https://www.youtube.com/results?search_query=vector+database+tutorial"),
        },
    },
    "UI/UX Designer": {
        "skills": ["Figma", "UI Design", "User Research", "Wireframing", "Prototyping", "Adobe XD", "Design Systems", "Accessibility"],
        "courses": {
            "Figma":            ("Figma UI Design Tutorial – YouTube", "https://www.youtube.com/watch?v=FTFaQWZBqQ8"),
            "UI Design":        ("Google UX Design Certificate – Coursera", "https://www.coursera.org/professional-certificates/google-ux-design"),
            "User Research":    ("User Research – Interaction Design Foundation", "https://www.interaction-design.org/courses/user-research-methods-and-best-practices"),
            "Wireframing":      ("Wireframing Basics – YouTube", "https://www.youtube.com/watch?v=aqdn7vVKygA"),
            "Prototyping":      ("Figma Prototyping – YouTube", "https://www.youtube.com/watch?v=lTIeZ2ahEkQ"),
            "Adobe XD":         ("Adobe XD Tutorial – YouTube", "https://www.youtube.com/watch?v=68w2VwalD5w"),
            "Design Systems":   ("Design Systems – YouTube", "https://www.youtube.com/watch?v=RtWABqFTbNQ"),
            "Accessibility":    ("Web Accessibility – Google Developers", "https://web.dev/learn/accessibility"),
        },
    },
    "DevOps Engineer": {
        "skills": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Monitoring", "Git"],
        "courses": {
            "Linux":       ("Linux Command Line – freeCodeCamp", "https://www.youtube.com/watch?v=ZtqBQ68cfJc"),
            "Docker":      ("Docker Full Course – TechWorld with Nana", "https://www.youtube.com/watch?v=3c-iBn73dDE"),
            "Kubernetes":  ("Kubernetes Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=X48VuDVv0do"),
            "CI/CD":       ("GitHub Actions – YouTube", "https://www.youtube.com/watch?v=mFFXuXjVgkU"),
            "AWS":         ("AWS Cloud Practitioner – freeCodeCamp", "https://www.youtube.com/watch?v=SOTamWNgDKc"),
            "Terraform":   ("Terraform Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=SLB_c_ayRMo"),
            "Monitoring":  ("Prometheus & Grafana – YouTube", "https://www.youtube.com/watch?v=9TJx7QTrTyo"),
            "Git":         ("Git & GitHub – freeCodeCamp", "https://www.youtube.com/watch?v=RGOj5yH7evk"),
        },
    },
    "Product Manager": {
        "skills": ["Product Strategy", "User Stories", "Agile", "Data Analysis", "Roadmapping", "Stakeholder Communication", "A/B Testing", "SQL"],
        "courses": {
            "Product Strategy":           ("Product Management – Coursera (Google)", "https://www.coursera.org/professional-certificates/google-project-management"),
            "User Stories":               ("Writing User Stories – YouTube", "https://www.youtube.com/watch?v=apOvF9NVguA"),
            "Agile":                      ("Agile & Scrum Full Course – YouTube", "https://www.youtube.com/watch?v=gy1c4_YixCo"),
            "Data Analysis":              ("Google Data Analytics Certificate", "https://www.coursera.org/professional-certificates/google-data-analytics"),
            "Roadmapping":                ("Product Roadmapping – YouTube", "https://www.youtube.com/results?search_query=product+roadmap+tutorial"),
            "Stakeholder Communication":  ("Communication Skills – LinkedIn Learning", "https://www.linkedin.com/learning/topics/communication"),
            "A/B Testing":                ("A/B Testing – Udacity", "https://www.udacity.com/course/ab-testing--ud257"),
            "SQL":                        ("SQL for Data Analysis – Mode", "https://mode.com/sql-tutorial/"),
        },
    },
    "Cybersecurity Analyst": {
        "skills": ["Networking", "Linux", "Python", "Ethical Hacking", "SIEM", "Incident Response", "Cryptography", "Risk Management"],
        "courses": {
            "Networking":         ("CompTIA Network+ – YouTube", "https://www.youtube.com/watch?v=qiQR5rTSshw"),
            "Linux":              ("Linux for Hackers – YouTube", "https://www.youtube.com/watch?v=VbEx7B_PTOE"),
            "Python":             ("Python for Cybersecurity – YouTube", "https://www.youtube.com/results?search_query=python+for+cybersecurity"),
            "Ethical Hacking":    ("Ethical Hacking Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=3Kq1MIfTWCE"),
            "SIEM":               ("Splunk Tutorial – YouTube", "https://www.youtube.com/watch?v=xUwRMq1WQKQ"),
            "Incident Response":  ("Incident Response – Cybrary", "https://www.cybrary.it/course/incident-response/"),
            "Cryptography":       ("Cryptography – Khan Academy", "https://www.khanacademy.org/computing/computer-science/cryptography"),
            "Risk Management":    ("Risk Management – Coursera", "https://www.coursera.org/learn/risk-management"),
        },
    },
    "Mobile Developer": {
        "skills": ["React Native", "Flutter", "JavaScript", "Dart", "REST APIs", "App Store Deployment", "State Management", "UI Design"],
        "courses": {
            "React Native":          ("React Native Full Course – YouTube", "https://www.youtube.com/watch?v=0-S5a0eXPoc"),
            "Flutter":               ("Flutter Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=VPvVD8t02U8"),
            "JavaScript":            ("JavaScript Full Course – freeCodeCamp", "https://www.youtube.com/watch?v=PkZNo7MFNFg"),
            "Dart":                  ("Dart Full Tutorial – YouTube", "https://www.youtube.com/watch?v=Ej_Pcr4uC2Q"),
            "REST APIs":             ("REST API Tutorial – YouTube", "https://www.youtube.com/watch?v=0sOvCWFmrtA"),
            "App Store Deployment":  ("iOS App Store Deployment – YouTube", "https://www.youtube.com/results?search_query=app+store+deployment+tutorial"),
            "State Management":      ("State Management in Flutter – YouTube", "https://www.youtube.com/watch?v=3tm-R7ymwhc"),
            "UI Design":             ("Mobile UI Design – YouTube", "https://www.youtube.com/results?search_query=mobile+ui+design"),
        },
    },
}

# ── Chatbot knowledge base ──────────────────────────────────────────────────────
CHAT_RESPONSES = {
    ("python", "learn python", "how to learn python"):
        "🐍 **Python Tips:**\nStart with [Python for Everybody on Coursera](https://www.coursera.org/specializations/python). Practice daily on [HackerRank](https://hackerrank.com) or [LeetCode](https://leetcode.com). Build real projects early — a scraper, a CLI tool, or a data analysis notebook.",

    ("react", "frontend", "learn react"):
        "⚛️ **React Path:**\n1. Solidify JavaScript fundamentals first (closures, promises, ES6+)\n2. [Scrimba React Course](https://scrimba.com/learn/learnreact) is excellent and interactive\n3. Build a personal project (todo app → weather app → e-commerce demo)\n4. Learn React Router + React Query/Zustand for real-world apps",

    ("project", "projects", "suggest project", "project ideas"):
        "🛠️ **Project Ideas by Role:**\n\n• **Data Scientist:** Dataset EDA on Kaggle, stock price predictor, churn analysis\n• **Web Dev:** Portfolio site, clone a SaaS landing page, build a blog CMS\n• **AI Engineer:** Fine-tune a HuggingFace model, RAG chatbot, image classifier\n• **DevOps:** Deploy a 3-tier app on AWS, set up a CI/CD pipeline with GitHub Actions",

    ("roadmap", "3 month", "3-month plan", "learning plan"):
        "📅 **3-Month Career Roadmap:**\n\n**Month 1 — Foundation**\nFocus on 1-2 core skills. Take structured courses, code daily.\n\n**Month 2 — Build**\nStart 2 real-world projects. Apply what you learned. Document on GitHub.\n\n**Month 3 — Polish & Apply**\nRefine your portfolio, write LinkedIn posts about your journey, apply to jobs weekly.",

    ("sql", "database"):
        "🗄️ **SQL Resources:**\n• [Mode SQL Tutorial](https://mode.com/sql-tutorial/) — best free resource\n• [SQLZoo](https://sqlzoo.net) — interactive practice\n• Practice with real datasets on [Kaggle](https://kaggle.com)\n• Learn joins, aggregations, window functions, and CTEs",

    ("machine learning", "ml", "deep learning"):
        "🤖 **ML Learning Path:**\n1. Linear Algebra + Stats basics (Khan Academy)\n2. [Andrew Ng ML Specialization](https://www.coursera.org/specializations/machine-learning-introduction) — the gold standard\n3. [fast.ai](https://course.fast.ai) for deep learning (top-down approach)\n4. Implement papers from scratch on Kaggle competitions",

    ("interview", "job", "get hired", "resume"):
        "💼 **Job-Ready Tips:**\n• **Portfolio:** 3-5 quality projects on GitHub with README files\n• **Resume:** Keep it 1 page, use action verbs, quantify impact\n• **LinkedIn:** Post weekly about your learning journey\n• **Practice:** LeetCode 75 questions for coding interviews\n• **Networking:** Reach out to 3 professionals per week",

    ("docker", "kubernetes", "devops"):
        "🐳 **DevOps Path:**\n1. Linux fundamentals first — [this YouTube course](https://www.youtube.com/watch?v=ZtqBQ68cfJc)\n2. [Docker Full Course by TechWorld with Nana](https://www.youtube.com/watch?v=3c-iBn73dDE)\n3. Kubernetes after Docker is solid\n4. Pick AWS, GCP or Azure and get a cloud cert",
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _match_skills(user_skills: List[str], required: List[str]):
    matched, missing = [], []
    for req in required:
        req_l = req.lower()
        if any(req_l in u.lower() or u.lower() in req_l for u in user_skills):
            matched.append(req)
        else:
            missing.append(req)
    return matched, missing


def _build_roadmap(missing: List[str], courses: dict, experience: str) -> List[dict]:
    duration_map = {"Beginner": "2-3 weeks", "Intermediate": "1-2 weeks", "Advanced": "3-5 days"}
    duration = duration_map.get(experience, "1-2 weeks")
    roadmap = []
    for skill in missing:
        course_name, link = courses.get(skill, (f"{skill} Tutorial", f"https://www.youtube.com/results?search_query={skill.replace(' ','+')}+tutorial"))
        roadmap.append({
            "title": f"Master {skill}",
            "duration": duration,
            "type": course_name,
            "link": link,
            "skill_target": skill,
        })
    return roadmap


# ── Routes ────────────────────────────────────────────────────────────────────

router_api = APIRouter()


@router_api.get("/roles")
def get_roles() -> List[str]:
    return list(MOCK_ROLES.keys())


@router_api.post("/analyze")
def analyze_skills(
    role: str = Form(...),
    skills: str = Form(...),
    experience: str = Form("Beginner"),
    resume: Optional[UploadFile] = File(None),
):
    user_skills = [s.strip() for s in skills.split(",") if s.strip()]

    role_data = MOCK_ROLES.get(role, {})
    required = role_data.get("skills", [])
    courses = role_data.get("courses", {})

    if resume and resume.filename.endswith(".pdf"):
        try:
            pdf_bytes = resume.file.read()
            text = extract_text_from_pdf(pdf_bytes)
            for req in required:
                if req.lower() in text.lower() and req not in user_skills:
                    user_skills.append(req)
        except Exception as e:
            print(f"Error parsing resume: {e}")

    matched, missing = _match_skills(user_skills, required)
    match_pct = int((len(matched) / len(required)) * 100) if required else 0
    roadmap = _build_roadmap(missing, courses, experience)

    return {
        "role": role,
        "experience": experience,
        "match_percentage": match_pct,
        "matched_skills": matched,
        "missing_skills": missing,
        "roadmap": roadmap,
    }


@router_api.post("/chat")
def chat(req: ChatRequest):
    msg = req.message.lower().strip()
    
    # Try local rules first for instant robust responses
    for keys, reply in CHAT_RESPONSES.items():
        if isinstance(keys, tuple):
            if any(k in msg for k in keys):
                return {"reply": reply}
        elif keys in msg:
            return {"reply": reply}

    # Use Gemini API if available
    try:
        if os.getenv("GEMINI_API_KEY"):
            model = genai.GenerativeModel("gemini-1.5-flash") # Use flash for quick responses
            prompt = f"You are SkillGap AI, a career and coding assistant. A user asks: {req.message}\nProvide a concise and helpful answer in markdown."
            response = model.generate_content(prompt)
            return {"reply": response.text}
    except Exception as e:
        print(f"Gemini error: {e}")

    # Generic fallback
    return {
        "reply": (
            "Great question! I couldn't reach my advanced AI brain (Gemini API key missing). Here are my top local tips:\n\n"
            "1. **Check your roadmap** on the Dashboard — it's tailored to your missing skills.\n"
            "2. **Consistency beats intensity** — 1 hour daily > 8 hours on weekends.\n"
            "3. **Build projects** as early as possible. Real code sticks.\n\n"
            "Try asking me about: *Python, React, Machine Learning, projects, roadmap, or interview tips!*"
        )
    }


# Attach to main router alias
router = router_api
