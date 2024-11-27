import requests

# Define the API endpoint
# url = "http://localhost:3000/teacher/add-event"  # Replace with your actual endpoint URL
url = "https://isph-sse.vercel.app/teacher/add-event"  # Replace with your actual endpoint URL

# Test cases
test_cases = [
    {
        "description": "Valid request",
        "payload": {
            "eventDetails": {
                "event_name": "Science Fair",
                "event_description": "Annual science fair event for students. with Rua Bien being the host and Voi being the winner of the science fair.",
            },
            "user": {"uid": "asdfasferfasdfasrfasrfasrf"}
        },
        "expected_status": 200
    },
    {
        "description": "Missing eventDetails",
        "payload": {},
        "expected_status": 400
    },
    {
        "description": "Missing required fields",
        "payload": {
            "eventDetails": {
                "event_name": "Science Fair"
            }
        },
        "expected_status": 400
    }
]

# Run tests
# for case in test_cases:
#     print(f"Running test: {case['description']}")
#     response = requests.post(url, json=case['payload'])
#     print(f"Status Code: {response.status_code}")
#     print(f"Response: {response.text}")
#     assert response.status_code == case['expected_status'], f"Test failed for {case['description']}"

response = requests.post(url, json=test_cases[0]['payload'])
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
