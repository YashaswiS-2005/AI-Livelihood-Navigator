from typing import Dict, Any, List
from backend.engine.skill_mapper import get_skill_mapper
from backend.engine.rag_retriever import get_program_retriever
from backend.engine.eligibility_engine import check_eligibility

class AgentTools:
    """
    Standard Python tool suite for SkillSaathi conversational agent.
    The agent calls these tools to execute deterministic domain logic.
    """

    @staticmethod
    def update_profile(current_profile: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Tool 1: update_profile()
        Updates the structured user profile with new or corrected field values.
        Supports voice corrections ("No, my experience is 7 years").
        """
        updated = current_profile.copy()
        for key, val in updates.items():
            if val is not None and val != "":
                if key == "experience_years":
                    try:
                        updated[key] = int(val)
                    except (ValueError, TypeError):
                        updated[key] = val
                elif key == "skills" and isinstance(val, list):
                    existing = updated.get("skills", [])
                    for s in val:
                        if s not in existing:
                            existing.append(s)
                    updated["skills"] = existing
                else:
                    updated[key] = val
        return updated

    @staticmethod
    def map_skill(work_description: str, occupation: str = None) -> List[Dict[str, Any]]:
        """
        Tool 2: map_skill()
        Maps raw informal spoken descriptions into controlled standardized skills.
        """
        mapper = get_skill_mapper()
        return mapper.map_description_to_skills(work_description, occupation)

    @staticmethod
    def retrieve_programs(
        skills: List[str],
        occupation: str,
        location: str = "Karnataka",
        education: str = "Class 10",
        experience_years: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Tool 3: retrieve_programs()
        Executes RAG vector search over verified skilling programs.
        """
        retriever = get_program_retriever()
        return retriever.search_programs(
            skills=skills,
            occupation=occupation,
            location=location,
            education=education,
            experience_years=experience_years
        )

    @staticmethod
    def check_eligibility(program: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Tool 4: check_eligibility()
        Runs deterministic Python rules to evaluate candidate eligibility.
        """
        return check_eligibility(program, profile)

    @staticmethod
    def build_application(profile: Dict[str, Any], selected_program: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Tool 5: build_application()
        Generates auto-populated application form payload and verification checks.
        """
        skills_str = ", ".join(profile.get("skills", []))
        form_fields = {
            "applicant_name": profile.get("name") or "Not Provided Yet",
            "language_preference": profile.get("language", "en-IN"),
            "occupation": profile.get("occupation") or "Not Specified Yet",
            "experience_years": profile.get("experience_years") if profile.get("experience_years") is not None else "Not Specified Yet",
            "education_qualification": profile.get("education") or "Not Specified Yet",
            "location_state": profile.get("location") or "Not Specified Yet",
            "standardized_skills": profile.get("skills", []),
            "skills_formatted": skills_str if skills_str else "None Mapped Yet",
            "target_program": selected_program.get("program_name") if selected_program else "Not Selected Yet",
            "target_program_id": selected_program.get("program_id") if selected_program else "N/A",
            "submission_status": "Ready for Voice Confirmation",
            "is_complete": bool(profile.get("occupation") and profile.get("location") and profile.get("education"))
        }

        readout_script = (
            f"Here is your application preview. Applicant Name: {form_fields['applicant_name']}. "
            f"Occupation: {form_fields['occupation']} with {form_fields['experience_years']} years of experience. "
            f"Education: {form_fields['education_qualification']}. Location: {form_fields['location_state']}. "
            f"Skills mapped: {skills_str}. Target Program: {form_fields['target_program']}. "
            f"Please review and confirm to submit your application."
        )

        return {
            "form": form_fields,
            "readout_script": readout_script
        }
