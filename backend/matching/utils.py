import re
from .models import UserSkillProgress
from sentence_transformers import SentenceTransformer, util
SKILL_SYNONYMS = {
    "react.js": "react",
    "reactjs": "react",
    "js": "javascript",
    "nodejs": "node.js",
    "node": "node.js",
    "postgres": "postgresql",
    "postgre": "postgresql",
    "asp.net": ".net",
    "dotnet": ".net",
    "c sharp": "c#",
    "csharp": "c#",
    "machine-learning": "machine learning",
    "deep-learning": "deep learning",
    "restful api": "rest api",
    "restfulapis": "rest api",

    # yeni ekle
    "restful": "rest api",
    "restfull": "rest api",
    "restful api": "rest api",
    "web socket": "websocket",
    "web-socket": "websocket",
    "micro servis": "microservice",
    "mikro servis": "microservice",
    "mikro servisler": "microservices",
    "micro servisler": "microservices",
    "google cloud services": "google cloud",
    "gcp": "google cloud",
    "push notification": "push notification",
    "push notifications": "push notification",
    "react ile": "react",
}

KNOWN_SKILLS = [
    # Programming languages
    "python",
    "java",
    "c",
    "c#",
    "c++",
    "javascript",
    "typescript",
    "dart",
    "kotlin",
    "swift",

    # Frontend
    "html",
    "css",
    "react",
    "next.js",
    "tailwind",
    "bootstrap",

    # Mobile
    "flutter",
    "ios",
    "android",
    "mobile development",
    "mobile backend",
    "state management",
    "provider",
    "bloc",
    "getx",
    "push notification",
    "firebase",

    # Backend
    "node.js",
    ".net",
    "asp.net",
    "django",
    "flask",
    "fastapi",
    "spring",
    "rest api",
    "api",
    "web service",
    "web services",
    "microservice",
    "microservices",
    "backend",
    "back-end",

    # Data formats / protocols
    "json",
    "xml",
    "websocket",
    "graphql",

    # Database
    "sql",
    "mysql",
    "postgresql",
    "mongodb",

    # Cloud / DevOps
    "docker",
    "kubernetes",
    "git",
    "github",
    "svn",
    "bitbucket",
    "linux",
    "aws",
    "azure",
    "google cloud",
    "google cloud services",

    # AI / Data
    "tensorflow",
    "pytorch",
    "machine learning",
    "deep learning",
    "nlp",
    "opencv",
]

def normalize_text(text: str) -> str:
    text = text.lower().strip()

    for old, new in SKILL_SYNONYMS.items():
        text = text.replace(old, new)

    return text


def extract_skills(text: str):
    if not text:
        return []

    text = normalize_text(text)

    found_skills = []
    for skill in KNOWN_SKILLS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text):
            found_skills.append(skill)

    return sorted(list(set(found_skills)))
def calculate_skill_match(resume_text: str, job_text: str, user=None):
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_text)

    matched_skills = sorted(list(set(resume_skills) & set(job_skills)))
    missing_skills = sorted(list(set(job_skills) - set(resume_skills)))

    semantic_score = calculate_semantic_similarity(resume_text, job_text)

    completed_skills = set()
    completed_required = []
    completed_optional = []
    bonus_score = 0

    if user is not None:
        completed_skills = set(
            UserSkillProgress.objects.filter(
                user=user,
                status="completed"
            ).values_list("skill_name", flat=True)
        )
        completed_skills = {skill.strip().lower() for skill in completed_skills}

        job_skills_normalized = [skill.strip().lower() for skill in job_skills]
        matched_skills_normalized = {skill.strip().lower() for skill in matched_skills}
        missing_skills_normalized = [skill.strip().lower() for skill in missing_skills]

        completed_required = [
            skill for skill in job_skills_normalized
            if skill in completed_skills
        ]

        missing_skills_normalized = [
            skill for skill in missing_skills_normalized
            if skill not in completed_skills
        ]

        matched_skills_normalized.update(completed_required)

        matched_skills = sorted(list(matched_skills_normalized))
        missing_skills = sorted(list(set(missing_skills_normalized)))

    if len(job_skills) > 0:
        skill_score = round((len(matched_skills) / len(job_skills)) * 100)
    else:
        skill_score = 0

    final_score = round((skill_score * 0.6) + (semantic_score * 0.4))
    final_score = min(100, final_score)

    return {
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "matched_skills": matched_skills or [],
        "missing_skills": missing_skills or [],
        "skill_score": skill_score,
        "semantic_score": semantic_score,
        "score": final_score,
        "completed_by_user": sorted(list(completed_skills)),
        "completed_required": completed_required,
        "completed_optional": completed_optional,
        "bonus_score": bonus_score,
    }



def generate_recommendation(missing_skills, final_score=0, job_skills=None):
    job_skills = job_skills or []

    if not job_skills:
        if final_score >= 75:
            return "İş ilanında belirgin beceri bulunamadı, ancak genel içerik uyumu yüksek görünüyor."
        elif final_score >= 50:
            return "İş ilanında belirgin beceri bulunamadı. Genel içerik uyumu orta seviyede görünüyor."
        else:
            return "İş ilanında belirgin beceri bulunamadı. Genel içerik uyumu düşük olduğu için manuel inceleme önerilir."

    if not missing_skills:
        if final_score >= 75:
            return "CV içeriğiniz iş ilanı ile yüksek düzeyde uyumludur."
        elif final_score >= 50:
            return "CV içeriğiniz iş ilanı ile genel olarak uyumludur, ancak manuel kontrol önerilir."
        else:
            return "Beceri eşleşmesi görünse de genel uyum düşüktür. İş ilanı ve CV içeriği detaylı incelenmelidir."

    if len(missing_skills) <= 2:
        return f"Geliştirmeniz önerilen beceriler: {', '.join(missing_skills)}"

    return f"Bu iş ilanı için eksik görülen temel beceriler: {', '.join(missing_skills[:5])}"

_sbert_model = None

def get_sbert_model():
    global _sbert_model
    if _sbert_model is None:
        _sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _sbert_model

def calculate_semantic_similarity(resume_text: str, job_text: str) -> int:
    if not resume_text or not job_text:
        return 0

    model = get_sbert_model()

    embeddings = model.encode(
        [resume_text, job_text],
        convert_to_tensor=True
    )

    similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
    normalized_score = max(0, min(100, round(similarity * 100)))
    print("SBERT RUNNING")
    print("SEMANTIC SCORE:", normalized_score)

    return normalized_score

