#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class HospitalityAPITester:
    def __init__(self, base_url="https://2cc4386a-33c8-47f0-b9ec-7ab4469f5518.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []
        self.admin_token = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.passed_tests.append(name)
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "No response"
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_endpoint(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_get_properties(self):
        """Test getting all properties"""
        success, data = self.run_test("Get Properties", "GET", "api/properties", 200)
        if success and isinstance(data, list) and len(data) >= 2:
            print(f"   Found {len(data)} properties")
            for prop in data:
                if 'property_id' in prop and 'name' in prop and 'price_per_night' in prop:
                    print(f"   - {prop['name']}: ₹{prop['price_per_night']}/night")
                else:
                    print(f"   - Property missing required fields: {prop}")
            return True, data
        elif success:
            print(f"   Warning: Expected at least 2 properties, got {len(data) if isinstance(data, list) else 'invalid data'}")
        return success, data

    def test_get_single_property(self, property_id):
        """Test getting a single property"""
        return self.run_test(f"Get Property {property_id}", "GET", f"api/properties/{property_id}", 200)

    def test_get_testimonials(self):
        """Test getting testimonials"""
        success, data = self.run_test("Get Testimonials", "GET", "api/testimonials", 200)
        if success and isinstance(data, list) and len(data) >= 4:
            print(f"   Found {len(data)} testimonials")
            for test in data:
                if 'name' in test and 'rating' in test:
                    print(f"   - {test['name']}: {test['rating']} stars")
        return success, data

    def test_create_booking(self):
        """Test creating a booking"""
        # Get tomorrow and day after for booking dates
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        day_after = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
        
        booking_data = {
            "property_id": "prop-001",
            "guest_name": "Test Guest",
            "guest_email": "test@example.com",
            "guest_phone": "+91 9876543210",
            "check_in": tomorrow,
            "check_out": day_after,
            "guests": 2,
            "total_amount": 3500
        }
        
        success, data = self.run_test("Create Booking", "POST", "api/bookings", 200, booking_data)
        if success and 'booking_id' in data:
            print(f"   Booking ID: {data['booking_id']}")
            if data.get('test_mode'):
                print(f"   Test Mode: {data['test_mode']}")
                print(f"   Order ID: {data.get('order_id', 'N/A')}")
            return True, data
        return success, data

    def test_confirm_booking(self, booking_id):
        """Test confirming a booking"""
        confirm_data = {"booking_id": booking_id}
        return self.run_test("Confirm Booking", "POST", "api/bookings/confirm", 200, confirm_data)

    def test_get_booking(self, booking_id):
        """Test getting a booking by ID"""
        return self.run_test(f"Get Booking {booking_id}", "GET", f"api/bookings/{booking_id}", 200)

    def test_submit_contact(self):
        """Test submitting contact form"""
        contact_data = {
            "name": "Test User",
            "phone": "+91 9876543210",
            "message": "This is a test message for the contact form."
        }
        return self.run_test("Submit Contact", "POST", "api/contact", 200, contact_data)

    def test_invalid_endpoints(self):
        """Test invalid endpoints return 404"""
        success, _ = self.run_test("Invalid Property ID", "GET", "api/properties/invalid-id", 404)
        success2, _ = self.run_test("Invalid Booking ID", "GET", "api/bookings/invalid-id", 404)
        return success and success2

    # --- Admin Panel Tests ---
    def test_admin_login(self, email="admin@hosting.com", password="Hosting@2026"):
        """Test admin login"""
        login_data = {"email": email, "password": password}
        success, data = self.run_test("Admin Login", "POST", "api/auth/login", 200, login_data)
        if success and 'token' in data:
            self.admin_token = data['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            print(f"   User: {data.get('user', {}).get('email')} ({data.get('user', {}).get('role')})")
            return True, data
        return success, data

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        login_data = {"email": "admin@hosting.com", "password": "wrongpassword"}
        return self.run_test("Admin Login Invalid", "POST", "api/auth/login", 401, login_data)

    def test_admin_me(self):
        """Test getting current admin user"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Admin Me", "GET", "api/auth/me", 200, headers=headers)

    def test_admin_stats(self):
        """Test getting admin stats"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        success, data = self.run_test("Admin Stats", "GET", "api/admin/stats", 200, headers=headers)
        if success:
            print(f"   Properties: {data.get('properties', 0)}")
            print(f"   Bookings: {data.get('bookings', 0)}")
            print(f"   Contacts: {data.get('contacts', 0)}")
            print(f"   Revenue: ₹{data.get('revenue', 0)}")
        return success, data

    def test_admin_bookings(self):
        """Test getting admin bookings"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Admin Bookings", "GET", "api/admin/bookings", 200, headers=headers)

    def test_admin_contacts(self):
        """Test getting admin contacts"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Admin Contacts", "GET", "api/admin/contacts", 200, headers=headers)

    def test_admin_create_property(self):
        """Test creating a property via admin"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        
        property_data = {
            "name": "Test Property",
            "location": "Test Location, Kochi",
            "price_per_night": 2500,
            "description": "A test property for API testing",
            "amenities": ["WiFi", "AC", "Kitchen"],
            "images": ["https://images.unsplash.com/photo-1721216596273-586bfde422e7?w=800&q=80"],
            "max_guests": 4,
            "rating": 4.0,
            "reviews_count": 0
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        success, data = self.run_test("Admin Create Property", "POST", "api/admin/properties", 200, property_data, headers)
        if success and 'property_id' in data:
            print(f"   Created property ID: {data['property_id']}")
            return True, data
        return success, data

    def test_admin_update_property(self, property_id):
        """Test updating a property via admin"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        
        update_data = {
            "name": "Updated Test Property",
            "price_per_night": 3000
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        return self.run_test(f"Admin Update Property {property_id}", "PUT", f"api/admin/properties/{property_id}", 200, update_data, headers)

    def test_admin_delete_property(self, property_id):
        """Test deleting a property via admin"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        return self.run_test(f"Admin Delete Property {property_id}", "DELETE", f"api/admin/properties/{property_id}", 200, headers=headers)

    def test_unauthorized_admin_access(self):
        """Test unauthorized access to admin endpoints"""
        # Test without token
        success1, _ = self.run_test("Unauthorized Admin Stats", "GET", "api/admin/stats", 401)
        
        # Test with invalid token
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer invalid_token'
        }
        success2, _ = self.run_test("Invalid Token Admin Stats", "GET", "api/admin/stats", 401, headers=headers)
        
        return success1 and success2

    def test_admin_logout(self):
        """Test admin logout"""
        return self.run_test("Admin Logout", "POST", "api/auth/logout", 200)

    # --- SMTP Email Tests ---
    def test_get_smtp_config(self):
        """Test getting SMTP configuration"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        success, data = self.run_test("Get SMTP Config", "GET", "api/admin/smtp", 200, headers=headers)
        if success:
            print(f"   SMTP Host: {data.get('smtp_host', 'Not configured')}")
            print(f"   SMTP Port: {data.get('smtp_port', 'Not configured')}")
            print(f"   Enabled: {data.get('enabled', False)}")
            print(f"   Password masked: {data.get('smtp_password') == '••••••••'}")
        return success, data

    def test_save_smtp_config(self):
        """Test saving SMTP configuration"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        
        smtp_config = {
            "smtp_host": "smtp.gmail.com",
            "smtp_port": 587,
            "smtp_username": "test@hosting.com",
            "smtp_password": "test_app_password",
            "from_email": "noreply@hosting.com",
            "from_name": "Hosting Kochi",
            "to_email": "admin@hosting.com",
            "use_tls": True,
            "enabled": True,
            "notify_booking": True,
            "notify_contact": True
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        success, data = self.run_test("Save SMTP Config", "POST", "api/admin/smtp", 200, smtp_config, headers)
        if success:
            print(f"   SMTP settings saved successfully")
        return success, data

    def test_smtp_test_email(self):
        """Test sending SMTP test email (expected to fail with test credentials)"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        # This should return 400 because we're using test SMTP credentials
        success, data = self.run_test("SMTP Test Email", "POST", "api/admin/smtp/test", 400, {}, headers)
        if success:
            print(f"   Expected failure with test SMTP credentials")
        return success, data

    def test_get_email_logs(self):
        """Test getting email logs"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False, {}
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        success, data = self.run_test("Get Email Logs", "GET", "api/admin/email-logs", 200, headers=headers)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} email log entries")
            for log in data[:3]:  # Show first 3 logs
                print(f"   - {log.get('type', 'unknown')}: {log.get('success', False)} ({log.get('created_at', 'no date')[:10]})")
        return success, data

    def test_unauthorized_smtp_access(self):
        """Test unauthorized access to SMTP endpoints"""
        # Test without token
        success1, _ = self.run_test("Unauthorized SMTP Config", "GET", "api/admin/smtp", 401)
        success2, _ = self.run_test("Unauthorized SMTP Save", "POST", "api/admin/smtp", 401, {})
        success3, _ = self.run_test("Unauthorized SMTP Test", "POST", "api/admin/smtp/test", 401, {})
        success4, _ = self.run_test("Unauthorized Email Logs", "GET", "api/admin/email-logs", 401)
        
        return success1 and success2 and success3 and success4

    def test_booking_email_notification(self):
        """Test that booking creation triggers email notification attempt"""
        # Get initial email logs count
        if self.admin_token:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.admin_token}'
            }
            initial_logs_success, initial_logs = self.run_test("Initial Email Logs", "GET", "api/admin/email-logs", 200, headers=headers)
            initial_count = len(initial_logs) if initial_logs_success and isinstance(initial_logs, list) else 0
        else:
            initial_count = 0

        # Create a booking
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        day_after = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
        
        booking_data = {
            "property_id": "prop-001",
            "guest_name": "Email Test Guest",
            "guest_email": "emailtest@example.com",
            "guest_phone": "+91 9876543210",
            "check_in": tomorrow,
            "check_out": day_after,
            "guests": 2,
            "total_amount": 3500
        }
        
        booking_success, booking_data_response = self.run_test("Booking for Email Test", "POST", "api/bookings", 200, booking_data)
        
        if booking_success and self.admin_token:
            # Wait a moment for async email processing
            import time
            time.sleep(2)
            
            # Check if email log was created
            final_logs_success, final_logs = self.run_test("Final Email Logs", "GET", "api/admin/email-logs", 200, headers=headers)
            if final_logs_success and isinstance(final_logs, list):
                final_count = len(final_logs)
                if final_count > initial_count:
                    print(f"   ✅ Email notification triggered (logs increased from {initial_count} to {final_count})")
                    # Check if the latest log is for booking
                    latest_log = final_logs[0] if final_logs else {}
                    if latest_log.get('type') == 'booking':
                        print(f"   ✅ Latest log is booking notification: {latest_log.get('ref_id')}")
                        return True, final_logs
                    else:
                        print(f"   ⚠️ Latest log is not booking type: {latest_log.get('type')}")
                else:
                    print(f"   ⚠️ No new email logs created (still {final_count})")
        
        return booking_success, booking_data_response

    def test_contact_email_notification(self):
        """Test that contact form submission triggers email notification attempt"""
        # Get initial email logs count
        if self.admin_token:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.admin_token}'
            }
            initial_logs_success, initial_logs = self.run_test("Initial Contact Email Logs", "GET", "api/admin/email-logs", 200, headers=headers)
            initial_count = len(initial_logs) if initial_logs_success and isinstance(initial_logs, list) else 0
        else:
            initial_count = 0

        # Submit contact form
        contact_data = {
            "name": "Email Test Contact",
            "phone": "+91 9876543210",
            "message": "This is a test message to check email notifications."
        }
        
        contact_success, contact_response = self.run_test("Contact for Email Test", "POST", "api/contact", 200, contact_data)
        
        if contact_success and self.admin_token:
            # Wait a moment for async email processing
            import time
            time.sleep(2)
            
            # Check if email log was created
            final_logs_success, final_logs = self.run_test("Final Contact Email Logs", "GET", "api/admin/email-logs", 200, headers=headers)
            if final_logs_success and isinstance(final_logs, list):
                final_count = len(final_logs)
                if final_count > initial_count:
                    print(f"   ✅ Email notification triggered (logs increased from {initial_count} to {final_count})")
                    # Check if the latest log is for contact
                    latest_log = final_logs[0] if final_logs else {}
                    if latest_log.get('type') == 'contact':
                        print(f"   ✅ Latest log is contact notification: {latest_log.get('ref_id')}")
                        return True, final_logs
                    else:
                        print(f"   ⚠️ Latest log is not contact type: {latest_log.get('type')}")
                else:
                    print(f"   ⚠️ No new email logs created (still {final_count})")
        
        return contact_success, contact_response

def main():
    print("🏨 Starting Hospitality Website API Tests")
    print("=" * 50)
    
    tester = HospitalityAPITester()
    
    # Test health endpoint first
    if not tester.test_health_endpoint()[0]:
        print("❌ Health check failed, stopping tests")
        return 1

    # Test properties endpoints
    properties_success, properties_data = tester.test_get_properties()
    if properties_success and properties_data:
        # Test getting individual property
        first_property_id = properties_data[0].get('property_id')
        if first_property_id:
            tester.test_get_single_property(first_property_id)

    # Test testimonials
    tester.test_get_testimonials()

    # Test booking flow
    booking_success, booking_data = tester.test_create_booking()
    if booking_success and 'booking_id' in booking_data:
        booking_id = booking_data['booking_id']
        
        # Test confirming the booking
        tester.test_confirm_booking(booking_id)
        
        # Test getting the booking
        tester.test_get_booking(booking_id)

    # Test contact form
    tester.test_submit_contact()

    # Test invalid endpoints
    tester.test_invalid_endpoints()

    print("\n" + "=" * 50)
    print("🔐 Starting Admin Panel API Tests")
    print("=" * 50)

    # Test admin authentication
    admin_login_success, admin_data = tester.test_admin_login()
    if not admin_login_success:
        print("❌ Admin login failed, skipping admin tests")
    else:
        # Test admin login validation
        tester.test_admin_login_invalid()
        
        # Test admin endpoints
        tester.test_admin_me()
        tester.test_admin_stats()
        tester.test_admin_bookings()
        tester.test_admin_contacts()
        
        # Test property CRUD operations
        create_success, create_data = tester.test_admin_create_property()
        if create_success and 'property_id' in create_data:
            test_property_id = create_data['property_id']
            
            # Test update
            tester.test_admin_update_property(test_property_id)
            
            # Test delete
            tester.test_admin_delete_property(test_property_id)
        
        # Test unauthorized access
        tester.test_unauthorized_admin_access()
        
        # Test SMTP email functionality
        print("\n" + "=" * 50)
        print("📧 Testing SMTP Email Functionality")
        print("=" * 50)
        
        # Test SMTP endpoints
        tester.test_get_smtp_config()
        tester.test_save_smtp_config()
        tester.test_smtp_test_email()  # Expected to fail with test credentials
        tester.test_get_email_logs()
        tester.test_unauthorized_smtp_access()
        
        # Test email notifications on booking/contact
        tester.test_booking_email_notification()
        tester.test_contact_email_notification()
        
        # Test logout
        tester.test_admin_logout()

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure}")
    
    if tester.passed_tests:
        print(f"\n✅ Passed Tests: {', '.join(tester.passed_tests)}")

    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())