import unittest

from fastapi.testclient import TestClient

from backend.main import app


class RecommendationProfileTests(unittest.TestCase):
    client = TestClient(app)

    def recommend(self, skills, interest, goal):
        response = self.client.post(
            "/api/recommend",
            json={"profile": {"skills": skills, "interest": interest, "goal": goal}},
        )
        self.assertEqual(response.status_code, 200)
        return [item["title"] for item in response.json()["recommendations"]]

    def test_farming_profile(self):
        titles = self.recommend("farming, tractor operation", "agriculture", "increase income")
        self.assertIn("Agricultural Equipment Operator", titles)

    def test_electrical_profile(self):
        titles = self.recommend("electrician, wiring, repair", "solar technology", "technical work")
        self.assertIn("Electrician Assistant", titles)

    def test_tailoring_profile(self):
        titles = self.recommend("tailoring, stitching", "fashion", "start a business")
        self.assertIn("Tailoring Assistant", titles)

    def test_construction_profile(self):
        titles = self.recommend("masonry, brick construction", "building", "stable work")
        self.assertIn("Masonry Assistant", titles)


if __name__ == "__main__":
    unittest.main()
