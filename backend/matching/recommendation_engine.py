from .models import UserSkillProgress


SKILL_BASE_WEIGHTS = {
    "python": 1.0,
    "django": 1.0,
    "flask": 0.9,
    "fastapi": 1.0,
    "java": 1.0,
    "spring": 1.0,
    "c#": 1.0,
    ".net": 1.0,
    "asp.net": 1.0,
    "javascript": 0.9,
    "typescript": 1.0,
    "react": 1.0,
    "next.js": 1.0,
    "node.js": 0.95,
    "html": 0.7,
    "css": 0.7,
    "sql": 1.0,
    "postgresql": 1.0,
    "mysql": 0.9,
    "mongodb": 0.85,
    "docker": 1.0,
    "linux": 0.95,
    "rest api": 1.0,
    "git": 0.7,
    "github": 0.6,
    "machine learning": 1.0,
    "deep learning": 1.0,
    "tensorflow": 0.9,
    "pytorch": 0.9,
    "data structures": 0.8,
    "algorithms": 0.8,
}

COURSE_LIBRARY = {
    "python": [
        {
            "title": "Python ile Programlama Temelleri",
            "provider": "BTK Akademi",
            "level": "Başlangıç",
            "url": "https://www.btkakademi.gov.tr"
        },
        {
            "title": "Python for Everybody",
            "provider": "Coursera",
            "level": "Başlangıç",
            "url": "https://www.coursera.org"
        },
    ],
    "django": [
        {
            "title": "Django Web Geliştirme",
            "provider": "Udemy",
            "level": "Orta",
            "url": "https://www.udemy.com"
        },
    ],
    "react": [
        {
            "title": "React Geliştirme Eğitimi",
            "provider": "Udemy",
            "level": "Orta",
            "url": "https://www.udemy.com"
        },
        {
            "title": "Frontend Development with React",
            "provider": "Coursera",
            "level": "Orta",
            "url": "https://www.coursera.org"
        },
    ],
    "typescript": [
        {
            "title": "TypeScript Temelleri",
            "provider": "Udemy",
            "level": "Başlangıç",
            "url": "https://www.udemy.com"
        },
    ],
    "docker": [
        {
            "title": "Docker ve Container Mantığı",
            "provider": "BTK Akademi",
            "level": "Orta",
            "url": "https://www.btkakademi.gov.tr"
        },
    ],
    "linux": [
        {
            "title": "Linux Komut Satırı",
            "provider": "BTK Akademi",
            "level": "Başlangıç",
            "url": "https://www.btkakademi.gov.tr"
        },
    ],
    "postgresql": [
        {
            "title": "PostgreSQL ile Veritabanı Yönetimi",
            "provider": "Udemy",
            "level": "Orta",
            "url": "https://www.udemy.com"
        },
    ],
    "rest api": [
        {
            "title": "REST API Tasarımı",
            "provider": "Coursera",
            "level": "Orta",
            "url": "https://www.coursera.org"
        },
    ],
    "c#": [
        {
            "title": "C# Programlama",
            "provider": "BTK Akademi",
            "level": "Başlangıç",
            "url": "https://www.btkakademi.gov.tr"
        },
    ],
    ".net": [
        {
            "title": ".NET Web Development",
            "provider": "Udemy",
            "level": "Orta",
            "url": "https://www.udemy.com"
        },
    ],
    "java": [
        {
            "title": "Java Programming Masterclass",
            "provider": "Udemy",
            "level": "Başlangıç",
            "url": "https://www.udemy.com"
        },
    ],
    "sql": [
        {
            "title": "SQL ile Veritabanı Sorgulama",
            "provider": "BTK Akademi",
            "level": "Başlangıç",
            "url": "https://www.btkakademi.gov.tr"
        },
    ],
    "html": [
        {
            "title": "HTML5 Temelleri",
            "provider": "BTK Akademi",
            "level": "Başlangıç",
            "url": "https://www.btkakademi.gov.tr"
        },
    ],
    "css": [
        {
            "title": "CSS3 ile Arayüz Geliştirme",
            "provider": "Udemy",
            "level": "Başlangıç",
            "url": "https://www.udemy.com"
        },
    ],
    "javascript": [
        {
            "title": "Modern JavaScript",
            "provider": "Udemy",
            "level": "Orta",
            "url": "https://www.udemy.com"
        },
    ],
}

ROLE_ROADMAPS = {
    "backend developer": ["python", "django", "rest api", "postgresql", "docker", "linux", "git"],
    "frontend developer": ["html", "css", "javascript", "typescript", "react", "next.js", "git"],
    "fullstack developer": ["html", "css", "javascript", "react", "python", "django", "sql", "docker", "git"],
    "data scientist": ["python", "sql", "machine learning", "deep learning", "tensorflow", "pytorch"],
}


def normalize_skill(skill: str) -> str:
    return skill.strip().lower()


def get_skill_weight(skill: str, weighted_job_skills=None) -> float:
    skill = normalize_skill(skill)

    if weighted_job_skills and skill in weighted_job_skills:
        return weighted_job_skills[skill]

    return SKILL_BASE_WEIGHTS.get(skill, 0.6)


def generate_recommendations(missing_skills, weighted_job_skills):
    recommendations = []

    for skill in missing_skills:
        normalized = skill.lower().strip()
        importance = weighted_job_skills.get(normalized, 0.5)
        course_list = COURSE_LIBRARY.get(normalized, [])

        recommendations.append({
            "skill": skill,
            "importance": importance,
            "courses": course_list,
        })

    recommendations.sort(key=lambda x: x["importance"], reverse=True)
    return recommendations


def detect_target_role(job_title: str, job_text: str) -> str:
    combined = f"{job_title} {job_text}".lower()

    if "frontend" in combined:
        return "frontend developer"
    if "backend" in combined:
        return "backend developer"
    if "fullstack" in combined or "full stack" in combined:
        return "fullstack developer"
    if "data scientist" in combined or "machine learning" in combined:
        return "data scientist"

    return "backend developer"


def build_role_roadmap(role_name: str, resume_skills):
    role_name = role_name.lower()
    resume_skill_set = {normalize_skill(skill) for skill in resume_skills}

    roadmap = ROLE_ROADMAPS.get(role_name, [])
    steps = []

    for idx, skill in enumerate(roadmap, start=1):
        steps.append({
            "step": idx,
            "skill": skill,
            "completed": skill in resume_skill_set
        })

    remaining = [item["skill"] for item in steps if not item["completed"]]

    return {
        "role": role_name,
        "total_steps": len(steps),
        "completed_steps": len([x for x in steps if x["completed"]]),
        "remaining_steps": len(remaining),
        "remaining_skills": remaining,
        "steps": steps,
    }

PRIORITY_KEYWORDS_REQUIRED = [
    "zorunlu",
    "must",
    "required",
    "gerekli",
    "olmazsa olmaz",
]

PRIORITY_KEYWORDS_OPTIONAL = [
    "tercihen",
    "plus",
    "preferred",
    "nice to have",
    "artı",
]

SKILL_SYNONYMS = {
    "restful api": "rest api",
    "restful apis": "rest api",
    "postgres": "postgresql",
    "js": "javascript",
    "ts": "typescript",
    "dotnet": ".net",
    "asp.net core": "asp.net",
}


def normalize_skill(skill: str) -> str:
    skill = skill.strip().lower()
    return SKILL_SYNONYMS.get(skill, skill)


def detect_priority_for_skill(skill, job_text):
    if not isinstance(job_text, str):
        job_text = " ".join(job_text) if isinstance(job_text, list) else str(job_text)

    text = job_text.lower()

    required_markers = [
        "zorunlu",
        "must",
        "required",
        "gerekli",
        "olmazsa olmaz",
    ]

    optional_markers = [
        "tercihen",
        "plus",
        "artı",
        "opsiyonel",
        "nice to have",
    ]

    for marker in required_markers:
        if marker in text and skill in text:
            return "required"

    for marker in optional_markers:
        if marker in text and skill in text:
            return "optional"

    return "optional"


def build_weighted_job_skills(job_skills, job_text):
    weighted = {}

    for skill in job_skills:
        normalized = skill.lower().strip()
        priority = detect_priority_for_skill(normalized, job_text)

        if priority == "required":
            weighted[normalized] = 1.0
        else:
            weighted[normalized] = 0.6

    return weighted


def split_required_optional_skills(job_skills, job_text: str):
    required = []
    optional = []

    for skill in job_skills:
        normalized = normalize_skill(skill)
        priority = detect_priority_for_skill(normalized, job_text)

        if priority == "required":
            required.append(normalized)
        else:
            optional.append(normalized)

    return {
        "required_skills": required,
        "optional_skills": optional,
    }


def estimate_learning_time(missing_skills, required_skills, optional_skills, job_skills=None):
    job_skills = job_skills or []

    if not job_skills:
        return {
            "label": "Belirsiz",
            "description": "İş ilanında belirgin beceri bulunamadığı için tahmini gelişim süresi hesaplanamadı."
        }

    required_missing = [s for s in missing_skills if s in required_skills]
    optional_missing = [s for s in missing_skills if s in optional_skills]

    if not required_skills and not optional_skills:
        score = len(missing_skills)
    else:
        score = len(required_missing) * 2 + len(optional_missing)

    if score == 0:
        return {
            "label": "0 hafta",
            "description": "Eksik beceri görünmüyor. Bu role oldukça yakınsınız."
        }
    elif score <= 2:
        return {
            "label": "2 hafta",
            "description": "Hedef role oldukça yakınsınız. Kısa bir yoğun tekrar yeterli olabilir."
        }
    elif score <= 5:
        return {
            "label": "1 ay",
            "description": "Temel eksikler tamamlanırsa bu role yaklaşabilirsiniz."
        }
    elif score <= 8:
        return {
            "label": "2 ay",
            "description": "Eksik beceriler belirgin. Düzenli bir çalışma planı gerekir."
        }
    else:
        return {
            "label": "3+ ay",
            "description": "Bu role ulaşmak için daha planlı ve aşamalı bir gelişim süreci gerekir."
        }
    

from urllib.parse import quote_plus

PROVIDER_SEARCH_URLS = {
    "Udemy": "https://www.udemy.com/courses/search/?q={query}",
    "Coursera": "https://www.coursera.org/search?query={query}",
    "BTK Akademi": "https://www.btkakademi.gov.tr/portal/course/search?q={query}",
}

def enrich_courses_with_search_links(recommendations):
    enriched = []

    for item in recommendations:
        courses = []
        for course in item.get("courses", []):
            provider = course.get("provider", "")
            title = course.get("title", item["skill"])
            search_template = PROVIDER_SEARCH_URLS.get(provider)

            if search_template:
                search_url = search_template.format(query=quote_plus(title))
            else:
                search_url = ""

            course_copy = dict(course)
            course_copy["search_url"] = search_url
            courses.append(course_copy)

        item_copy = dict(item)
        item_copy["courses"] = courses
        enriched.append(item_copy)

    return enriched

def build_learning_plan(target_role, recommendations, roadmap, resume_skills):
    normalized_resume_skills = {skill.lower().strip() for skill in resume_skills}

    roadmap_steps = roadmap.get("steps", [])
    steps = []

    for item in roadmap_steps:
        skill = item["skill"]
        normalized_step = skill.lower().strip()

        in_resume = normalized_step in normalized_resume_skills

        matched_recommendation = next(
            (r for r in recommendations if r["skill"].lower().strip() == normalized_step),
            None
        )

        suggested_course = None
        if matched_recommendation and matched_recommendation.get("courses"):
            suggested_course = matched_recommendation["courses"][0]
        else:
            suggested_course = {
                "title": f"{skill} eğitimi",
                "provider": "Google Arama",
                "level": "Başlangıç",
                "url": f"https://www.google.com/search?q={skill}+kursu"
            }

        steps.append({
            "step_number": item["step"],
            "skill": skill,
            "status": "cv_present" if in_resume else "missing",
            "suggested_course": suggested_course,
        })

    return {
        "target_role": target_role,
        "steps": steps,
        "total_steps": roadmap.get("total_steps", len(steps)),
        "completed_steps": len([s for s in steps if s["status"] == "cv_present"]),
        "remaining_steps": [s["skill"] for s in steps if s["status"] == "missing"],
    }