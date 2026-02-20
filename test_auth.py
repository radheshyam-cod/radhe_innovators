import requests

BASE_URL = "http://localhost:8000"

# 1. Test Login
print("Testing Login...")
login_data = {
    "email": "clinician@example.com",
    "password": "password123"
}
session = requests.Session()
response = session.post(f"{BASE_URL}/api/auth/login", json=login_data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# 2. Test Check
print("\nTesting Check Auth...")
response = session.get(f"{BASE_URL}/api/auth/check")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# 3. Test Logout
print("\nTesting Logout...")
response = session.post(f"{BASE_URL}/api/auth/logout")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# 4. Test Check again (should fail)
print("\nTesting Check Auth after logout...")
response = session.get(f"{BASE_URL}/api/auth/check")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
