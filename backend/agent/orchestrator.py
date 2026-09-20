import re
from typing import Dict, Any, List
from backend.agent.tools import AgentTools

class ConversationalOrchestrator:
    """
    12-Step Agent Orchestrator for SkillSaathi Voice Assistant.
    Asks one question at a time, detects missing information,
    maps skills via controlled taxonomy, retrieves programs via RAG,
    evaluates eligibility deterministically, and populates the application form.
    """

    QUESTIONS = {
        "occupation": "What work do you currently do? (For example: Electrician, Plumber, Automotive Technician, Welder)",
        "experience": "How many years of experience do you have in this work?",
        "skills": "What specific type of work or repairs do you perform daily? (For example: house wiring, fan repair, pipe fitting)",
        "education": "What is your highest education level? (For example: Class 8, Class 10, Class 12, ITI, Diploma)",
        "location": "In which state or district do you live?",
        "confirmation": "Do you confirm all the details in your application form for submission?"
    }

    AUDIO_PROMPTS = {
        "kn-IN": {
            "occupation": "ನೀವು ಪ್ರಸ್ತುತ ಯಾವ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೀರಿ? (ಉದಾಹರಣೆಗೆ: ಎಲೆಕ್ಟ್ರಿಷಿಯನ್, ಪ್ಲಂಬರ್)",
            "experience": "ನಿಮಗೆ ಈ ಕೆಲಸದಲ್ಲಿ ಎಷ್ಟು ವರ್ಷಗಳ ಅನುಭವವಿದೆ?",
            "skills": "ನೀವು ಪ್ರತಿದಿನ ನಿರ್ದಿಷ್ಟವಾಗಿ ಯಾವ ರೀತಿಯ ಕೆಲಸಗಳನ್ನು ಮಾಡುತ್ತೀರಿ?",
            "education": "ನಿಮ್ಮ ಶಿಕ್ಷಣ ಮಟ್ಟ ಏನು?",
            "location": "ನೀವು ಎಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಿ?",
            "confirmation": "ನಿಮ್ಮ ಅರ್ಜಿಯ ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸುತ್ತೀರಾ?"
        },
        "hi-IN": {
            "occupation": "आप वर्तमान में क्या काम करते हैं? (जैसे: इलेक्ट्रिशियन, प्लंबर)",
            "experience": "आपको इस काम में कितने वर्षों का अनुभव है?",
            "skills": "आप प्रतिदिन किस प्रकार का कार्य करते हैं?",
            "education": "आपकी शिक्षा का स्तर क्या है?",
            "location": "आप कहाँ रहते हैं?",
            "confirmation": "क्या आप अपने आवेदन के विवरण की पुष्टि करते हैं?"
        }
    }

    @classmethod
    def process_voice_turn(
        cls,
        user_speech: str,
        current_profile: Dict[str, Any],
        language: str = "en-IN"
    ) -> Dict[str, Any]:
        """
        Processes a spoken audio transcript turn and returns updated profile state,
        mapped skills, grounded program recommendations, and next question/audio response.
        """
        speech = user_speech.strip()
        speech_lower = speech.lower()
        profile = current_profile.copy() if current_profile else {
            "language": language,
            "occupation": None,
            "experience_years": None,
            "education": None,
            "location": None,
            "skills": []
        }

        agent_logs = []
        voice_correction_detected = False

        # Step 10: Allow voice corrections ("No, my experience is 7 years", "Change location to Karnataka")
        if any(w in speech_lower for w in ["change", "correction", "no,", "incorrect", "instead of", "my experience is"]):
            voice_correction_detected = True
            agent_logs.append("Voice correction intent detected.")
            
            # Check experience correction
            exp_match = re.search(r'(\d+)\s*(?:years|year|yrs)', speech_lower)
            if exp_match:
                new_exp = int(exp_match.group(1))
                profile["experience_years"] = new_exp
                agent_logs.append(f"Tool Call: update_profile(experience_years={new_exp})")

            # Check location correction
            for loc in ["Karnataka", "Maharashtra", "Tamil Nadu", "Uttar Pradesh", "Delhi", "Telangana", "Kerala", "Gujarat"]:
                if loc.lower() in speech_lower:
                    profile["location"] = loc
                    agent_logs.append(f"Tool Call: update_profile(location='{loc}')")

            # Check education correction
            for edu in ["Class 8", "Class 10", "Class 12", "ITI", "Diploma", "Below Class 8"]:
                if edu.lower() in speech_lower:
                    profile["education"] = edu
                    agent_logs.append(f"Tool Call: update_profile(education='{edu}')")

        # 0. Detect Name if spoken
        if not profile.get("name"):
            name_match = re.search(r'(?:i am|my name is|nanu|naanu|mera naam)\s+([A-Za-zಅ-ಹअ-ह]+)', speech_lower)
            if name_match:
                extracted_name = name_match.group(1).capitalize()
                # Exclude common non-name words
                if extracted_name.lower() not in ["a", "an", "the", "obha", "obba", "1", "one"]:
                    profile["name"] = extracted_name
                    agent_logs.append(f"Extracted Name: '{extracted_name}'")

        # 1. Detect Occupation (Comprehensive Multilingual Extraction - Always check spoken keywords)
        OCCUPATION_PATTERNS = [
            ("Farmer", ["farmer", "farming", "farm", "raitha", "raitharu", "raithu", "ryta", "rythu", "kisaan", "kheti", "krishi", "ರೈತ", "ರೈತರು", "ರೈತನ", "ಕೃಷಿ", "किसान", "खेती"]),
            ("Electrician", ["electrician", "electrical", "wiring", "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್", "ಇಲೆಕ್ಟ್ರಿಷಿಯನ್", "ಇಲೆಕ್ಟ್ರಿಕಲ್", "इलेक्ट्रिशियन", "बिजली"]),
            ("Plumber", ["plumber", "pipe", "sanitary", "ಪ್ಲಂಬರ್", "ಪೈಪ್", "प्लंबर", "नल"]),
            ("Mason", ["mason", "masonry", "brickwork", "construction", "ಮೇಸ್ತ್ರಿ", "ರಾಜಮೇಸ್ತ್ರಿ", "राजमिस्त्री"]),
            ("Carpenter", ["carpenter", "wood", "furniture", "ಮರಗೆಲಸ", "ಬಡಗಿ", "बढ़ई"]),
            ("Automotive Technician", ["mechanic", "automotive", "bike repair", "car repair", "ಆಟೋ", "ಮೆಕ್ಯಾನಿಕ್", "गाड़ी", "मैकेनिक"]),
            ("Welder", ["welder", "welding", "ವೆಲ್ಡರ್", "ವೇಲ್ಡರ್", "वेल्डर"]),
            ("Driver", ["driver", "driving", "cab driver", "ಡ್ರೈವರ್", "ಚಾಲಕ", "ड्राइवर", "चालक"]),
            ("Security Guard", ["security", "guard", "watchman", "ಸೆಕ್ಯೂರಿಟಿ", "ವಾಚ್ಮ್ಯಾನ್", "सिक्योरिटी", "चौकीदार"]),
            ("Painter", ["painter", "painting", "putty", "ಪೇಂಟರ್", "ಪೇಂಟಿಂಗ್", "पेंटर", "पुताई"]),
            ("AC Technician", ["ac technician", "ac repair", "air conditioner", "fridge repair", "ಏಸಿ ರಿಪೇರಿ", "एसी तकनीशियन"]),
            ("Housekeeper", ["housekeeper", "maid", "cleaning", "cook", "ಮನೆ ಕೆಲಸ", "कामवाली", "बाई"]),
            ("Tailor", ["tailor", "stitching", "tailoring", "ದರ್ಜಿ", "दर्जी"]),
            ("Solar Technician", ["solar", "solar panel", "pv panel"])
        ]

        for label, keywords in OCCUPATION_PATTERNS:
            if any(kw in speech_lower for kw in keywords):
                if profile.get("occupation") != label:
                    profile["occupation"] = label
                    # Reset skills to match new occupation if changed
                    profile["skills"] = []
                    agent_logs.append(f"Updated Occupation: '{label}' (Multilingual Match)")
                break

        # 2. Detect Experience (English, Kannada, Hindi)
        if profile.get("experience_years") is None:
            exp_match = re.search(r'(\d+|೬|೭|೮|೫|೪|೩|೨|೧)\s*(?:years|year|yrs|sal|ವರ್ಷ|ವರ್ಷಗಳ|साल|वर्ष)', speech_lower)
            if exp_match:
                raw_digit = exp_match.group(1)
                digit_map = {'೬': 6, '೭': 7, '೮': 8, '೫': 5, '೪': 4, '೩': 3, '೨': 2, '೧': 1}
                val = digit_map.get(raw_digit, raw_digit)
                try:
                    profile["experience_years"] = int(val)
                    agent_logs.append(f"Extracted Experience: {profile['experience_years']} years")
                except ValueError:
                    pass

        # 3. Detect & Map Skills (Controlled Skill Taxonomy)
        if speech and len(speech.split()) >= 2:
            agent_logs.append(f"Tool Call: map_skill('{speech}', occupation='{profile.get('occupation')}')")
            mapped = AgentTools.map_skill(speech, occupation=profile.get("occupation"))
            
            new_skill_names = [m["name"] for m in mapped]
            existing_skills = profile.get("skills", [])
            for sname in new_skill_names:
                if sname not in existing_skills:
                    existing_skills.append(sname)
            profile["skills"] = existing_skills

        # 4. Detect Education
        if not profile.get("education"):
            if "10" in speech or "ssl" in speech_lower or "sslc" in speech_lower or "tenth" in speech_lower:
                profile["education"] = "Class 10"
            elif "12" in speech or "puc" in speech_lower or "twelfth" in speech_lower:
                profile["education"] = "Class 12"
            elif "8" in speech or "eighth" in speech_lower:
                profile["education"] = "Class 8"
            elif "iti" in speech_lower:
                profile["education"] = "ITI"
            elif "diploma" in speech_lower:
                profile["education"] = "Diploma"

        # 5. Detect Location
        if not profile.get("location"):
            for loc in ["Karnataka", "Maharashtra", "Tamil Nadu", "Uttar Pradesh", "Delhi", "Telangana", "Kerala", "Gujarat", "Bangalore", "Bengaluru"]:
                if loc.lower() in speech_lower:
                    profile["location"] = "Karnataka" if loc.lower() in ["bangalore", "bengaluru", "karnataka"] else loc
                    agent_logs.append(f"Extracted Location: '{profile['location']}'")
                    break

        # Step 6: RAG Program Retrieval (Only if occupation is specified)
        retrieved_programs = []
        if profile.get("occupation"):
            agent_logs.append(f"Tool Call: retrieve_programs(skills={profile.get('skills', [])}, occupation='{profile.get('occupation')}')")
            retrieved_programs = AgentTools.retrieve_programs(
                skills=profile.get("skills", []),
                occupation=profile.get("occupation"),
                location=profile.get("location") or "All India",
                education=profile.get("education") or "Class 10",
                experience_years=profile.get("experience_years") if profile.get("experience_years") is not None else 0
            )

        # Step 7: Deterministic Eligibility Evaluation
        evaluated_programs = []
        for item in retrieved_programs:
            prog = item["program"]
            agent_logs.append(f"Tool Call: check_eligibility('{prog['program_id']}', profile)")
            elig_result = AgentTools.check_eligibility(prog, profile)
            evaluated_programs.append({
                "program": prog,
                "relevance_score": item["relevance_score"],
                "grounded_explanation": item["grounded_explanation"],
                "eligibility": elig_result
            })

        # Step 9: Build Application Form
        top_prog = evaluated_programs[0]["program"] if evaluated_programs else None
        app_build = AgentTools.build_application(profile, selected_program=top_prog)

        # Select prompt dictionary based on language
        prompts = cls.AUDIO_PROMPTS.get(language, cls.QUESTIONS)

        if not profile.get("occupation"):
            next_step = "collect_occupation"
            next_question = prompts.get("occupation", cls.QUESTIONS["occupation"])
        elif profile.get("experience_years") is None:
            next_step = "collect_experience"
            next_question = prompts.get("experience", cls.QUESTIONS["experience"])
        elif not profile.get("skills"):
            next_step = "collect_skills"
            next_question = prompts.get("skills", cls.QUESTIONS["skills"])
        elif not profile.get("education"):
            next_step = "collect_education"
            next_question = prompts.get("education", cls.QUESTIONS["education"])
        elif not profile.get("location"):
            next_step = "collect_location"
            next_question = prompts.get("location", cls.QUESTIONS["location"])
        else:
            next_step = "confirm_submission"
            next_question = prompts.get("confirmation", "All required details are collected! Please review your application form and click Submit.")

        # Multilingual Voice Script
        if language == "kn-IN":
            agent_voice_script = (
                f"{'ನಿಮ್ಮ ತಿದ್ದುಪಡಿಯ ಆಧಾರದ ಮೇಲೆ ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲಾಗಿದೆ. ' if voice_correction_detected else ''}"
                f"ದಾಖಲಾದ ವಿವರಗಳು: {profile.get('occupation', '')} ({profile.get('experience_years', '')} ವರ್ಷಗಳ ಅನುಭವ). "
                f"{next_question}"
            )
        elif language == "hi-IN":
            agent_voice_script = (
                f"{'आपके संशोधन के आधार पर प्रोफाइल अपडेट किया गया है। ' if voice_correction_detected else ''}"
                f"दर्ज विवरण: {profile.get('occupation', '')} ({profile.get('experience_years', '')} वर्ष अनुभव). "
                f"{next_question}"
            )
        else:
            agent_voice_script = (
                f"{'Updated profile based on your correction. ' if voice_correction_detected else ''}"
                f"Recorded: {profile.get('occupation', '')} with {profile.get('experience_years', '')} years experience. "
                f"{next_question}"
            )

        return {
            "status": "success",
            "profile": profile,
            "agent_logs": agent_logs,
            "recommended_programs": evaluated_programs,
            "application_form": app_build["form"],
            "agent_voice_script": agent_voice_script,
            "next_step": next_step,
            "next_question": next_question
        }
