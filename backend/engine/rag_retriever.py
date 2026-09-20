import json
import os
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RAGProgramRetriever:
    """
    RAG-Based Program Retrieval Engine.
    Retrieves verified skilling program documents using semantic embeddings & metadata filtering.
    Produces grounded explanations for why a program is recommended.
    """
    def __init__(self, dataset_path: str = None):
        if dataset_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            dataset_path = os.path.join(base_dir, "data", "skilling_programs.json")

        with open(dataset_path, "r", encoding="utf-8") as f:
            self.programs: List[Dict[str, Any]] = json.load(f)

        self._build_index()

    def _build_index(self):
        """Builds TF-IDF vector index over program descriptions, skills, and benefits."""
        self.documents = []
        for p in self.programs:
            doc = (
                f"{p['program_name']} {p['occupation']} "
                f"{' '.join(p['skills'])} {p['benefits']} {p['state']} "
                f"{p['eligibility']['min_education']}"
            )
            self.documents.append(doc)

        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)

    def search_programs(
        self,
        skills: List[str],
        occupation: str,
        location: str = "All India",
        education: str = "Class 10",
        experience_years: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Retrieves relevant programs matching user skills, occupation, and location filters.
        Generates grounded RAG explanation text.
        """
        query_text = f"{occupation} {' '.join(skills)} {location}"
        query_vec = self.vectorizer.transform([query_text])
        sim_scores = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        results = []
        for idx, p in enumerate(self.programs):
            relevance = float(sim_scores[idx])

            # Boost score if occupation matches
            if occupation and (p['occupation'].lower() == occupation.lower() or occupation in p['eligibility']['required_occupations']):
                relevance += 0.4

            # Boost if location matches state or state is 'All India'
            if p['state'] == 'All India' or (location and location.lower() in p['state'].lower()):
                relevance += 0.2

            # Check skill intersection count
            matching_skills = [s for s in skills if s in p['skills']]
            if matching_skills:
                relevance += 0.1 * len(matching_skills)

            grounded_explanation = (
                f"Recommended because you have {experience_years} years of experience as an {occupation} "
                f"and skills in {', '.join(matching_skills if matching_skills else skills)}. "
                f"This program provides {p['benefits']} Verified by {p['source']} on {p['last_verified']}."
            )

            results.append({
                "program": p,
                "relevance_score": round(min(relevance, 1.0), 2),
                "matching_skills": matching_skills,
                "grounded_explanation": grounded_explanation
            })

        # Sort by relevance score
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results

_retriever_instance = None
def get_program_retriever() -> RAGProgramRetriever:
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = RAGProgramRetriever()
    return _retriever_instance
