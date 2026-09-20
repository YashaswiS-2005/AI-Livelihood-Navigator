from typing import Dict, Any, Tuple, List

EDUCATION_LEVELS = {
    "Below Class 8": 1,
    "Class 8": 2,
    "Class 10": 3,
    "Class 12": 4,
    "ITI": 5,
    "Diploma": 6,
    "Graduate": 7
}

class DeterministicEligibilityEngine:
    """
    Pure Deterministic Python Eligibility Evaluator.
    Evaluates candidate eligibility strictly against program rules.
    Prevents LLM from inventing or hallucinating eligibility criteria.
    """
    
    @staticmethod
    def evaluate(program: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a program against a structured user profile.
        Returns detailed status (is_eligible: bool, passed_criteria: List, failed_criteria: List, reason: str).
        """
        eligibility_spec = program.get("eligibility", {})
        passed_criteria = []
        failed_criteria = []

        user_exp = int(user_profile.get("experience_years") or 0)
        user_edu = str(user_profile.get("education") or "Class 10")
        user_loc = str(user_profile.get("location") or "Karnataka")
        user_occ = str(user_profile.get("occupation") or "")

        # 1. Experience Check
        min_exp = eligibility_spec.get("min_experience_years", 0)
        if user_exp >= min_exp:
            passed_criteria.append(f"Experience ({user_exp} years) meets required minimum of {min_exp} years.")
        else:
            failed_criteria.append(f"Requires minimum {min_exp} years experience; you currently have {user_exp} years.")

        # 2. Education Level Check
        allowed_edu = eligibility_spec.get("allowed_education", [])
        min_edu = eligibility_spec.get("min_education", "Below Class 8")
        
        user_edu_score = EDUCATION_LEVELS.get(user_edu, 3)
        min_edu_score = EDUCATION_LEVELS.get(min_edu, 1)

        if allowed_edu and user_edu in allowed_edu:
            passed_criteria.append(f"Education level ('{user_edu}') is in allowed education categories.")
        elif user_edu_score >= min_edu_score:
            passed_criteria.append(f"Education level ('{user_edu}') satisfies minimum requirement of '{min_edu}'.")
        else:
            failed_criteria.append(f"Requires minimum education of '{min_edu}'; your recorded education is '{user_edu}'.")

        # 3. Location / State Match Check
        prog_state = program.get("state", "All India")
        if prog_state == "All India" or not user_loc or (user_loc.lower() in prog_state.lower()) or (prog_state.lower() in user_loc.lower()):
            passed_criteria.append(f"Location ('{user_loc if user_loc else 'All India'}') is eligible for '{prog_state}' program.")
        else:
            failed_criteria.append(f"Program available only in '{prog_state}'; your recorded location is '{user_loc}'.")

        # 4. Occupation Match Check
        req_occupations = eligibility_spec.get("required_occupations", [])
        if not user_occ or not req_occupations or user_occ in req_occupations or program.get("occupation") == user_occ:
            passed_criteria.append(f"Occupation ('{user_occ if user_occ else 'General'}') matches program target role.")
        else:
            failed_criteria.append(f"Program targeted for {', '.join(req_occupations)}; your occupation is '{user_occ}'.")

        is_eligible = len(failed_criteria) == 0

        summary_reason = (
            "Congratulations! You meet all eligibility criteria for this program." 
            if is_eligible 
            else f"Not eligible: {'; '.join(failed_criteria)}"
        )

        return {
            "program_id": program.get("program_id"),
            "program_name": program.get("program_name"),
            "is_eligible": is_eligible,
            "passed_criteria": passed_criteria,
            "failed_criteria": failed_criteria,
            "evaluation_summary": summary_reason,
            "rule_engine_type": "Deterministic Python Engine (Zero LLM Hallucination)"
        }

def check_eligibility(program: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
    return DeterministicEligibilityEngine.evaluate(program, user_profile)
