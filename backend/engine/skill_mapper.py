import json
import os
import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ControlledSkillMapper:
    """
    Standardized Skill Mapping Engine.
    Converts informal user work descriptions into controlled skill taxonomy entries.
    Prevents arbitrary skill name hallucination.
    """
    def __init__(self, taxonomy_path: str = None):
        if taxonomy_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            taxonomy_path = os.path.join(base_dir, "data", "skill_taxonomy.json")
        
        with open(taxonomy_path, "r", encoding="utf-8") as f:
            self.taxonomy = json.load(f)["occupations"]
            
        self._prepare_vectorizers()

    def _prepare_vectorizers(self):
        """Pre-computes TF-IDF index for each occupation's skills."""
        self.occupation_skills: Dict[str, List[Dict[str, Any]]] = {}
        self.vectorizers: Dict[str, TfidfVectorizer] = {}
        self.skill_vectors: Dict[str, Any] = {}

        for occupation, skills in self.taxonomy.items():
            self.occupation_skills[occupation] = skills
            documents = []
            for s in skills:
                # Combine name, category, description, and keywords
                doc = f"{s['name']} {s['category']} {s['description']} {' '.join(s['keywords'])}"
                documents.append(doc)
            
            vec = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vec.fit_transform(documents)
            self.vectorizers[occupation] = vec
            self.skill_vectors[occupation] = tfidf_matrix

    def map_description_to_skills(self, user_description: str, occupation: str = None) -> List[Dict[str, Any]]:
        """
        Maps user description to standardized skill names.
        If occupation is provided, maps within that occupation.
        If occupation is unknown, searches across all occupations.
        """
        user_desc_lower = user_description.lower()
        matched_skills = []

        target_occupations = [occupation] if occupation and occupation in self.taxonomy else list(self.taxonomy.keys())

        for occ in target_occupations:
            skills = self.occupation_skills[occ]
            vec = self.vectorizers[occ]
            matrix = self.skill_vectors[occ]

            # 1. Keyword direct matching check
            for s in skills:
                match_found = False
                for kw in s["keywords"]:
                    if kw in user_desc_lower or re.search(r'\b' + re.escape(kw) + r'\b', user_desc_lower):
                        match_found = True
                        break
                
                if match_found:
                    if s["name"] not in [m["name"] for m in matched_skills]:
                        matched_skills.append({
                            "id": s["id"],
                            "name": s["name"],
                            "category": s["category"],
                            "occupation": occ,
                            "match_confidence": 0.95,
                            "reason": f"Direct keyword match with '{kw}'"
                        })

            # 2. Vector Cosine Similarity matching
            try:
                user_vec = vec.transform([user_description])
                similarities = cosine_similarity(user_vec, matrix)[0]
                for idx, score in enumerate(similarities):
                    if score >= 0.15:
                        s = skills[idx]
                        if s["name"] not in [m["name"] for m in matched_skills]:
                            matched_skills.append({
                                "id": s["id"],
                                "name": s["name"],
                                "category": s["category"],
                                "occupation": occ,
                                "match_confidence": round(float(score), 2),
                                "reason": f"Semantic similarity score {round(float(score)*100)}%"
                            })
            except Exception as e:
                pass

        # Sort by match confidence
        matched_skills.sort(key=lambda x: x["match_confidence"], reverse=True)
        return matched_skills

# Singleton instance helper
_mapper_instance = None
def get_skill_mapper() -> ControlledSkillMapper:
    global _mapper_instance
    if _mapper_instance is None:
        _mapper_instance = ControlledSkillMapper()
    return _mapper_instance
