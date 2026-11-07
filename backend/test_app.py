import unittest
from unittest.mock import patch
from app import app
import pymongo.errors

def mock_insert_one(doc):
    doc['_id'] = 'mocked_id'
    return type('InsertOneResult', (object,), {'inserted_id': 'mocked_id'})()

class TestIssuesAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        app.config['SECRET_KEY'] = 'test_secret'

    # --- VALID SUBMISSIONS & ROLES ---

    @patch('app.issues_collection.insert_one', side_effect=mock_insert_one)
    def test_valid_submission_student(self, mock_insert):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
            sess['name'] = 'Test User'

        response = self.app.post('/api/issues', json={
            'title': 'Test title',
            'category': 'plumbing',
            'priority': 'High',
            'description': 'Test desc',
            'location': 'Test loc'
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json['success'])

    @patch('app.issues_collection.insert_one', side_effect=mock_insert_one)
    def test_valid_submission_faculty(self, mock_insert):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'faculty'
            sess['name'] = 'Test Faculty'

        response = self.app.post('/api/issues', json={
            'title': 'Test title',
            'category': 'plumbing',
            'priority': 'High',
            'description': 'Test desc',
            'location': 'Test loc'
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json['success'])

    # --- JSON PARSING ---

    def test_missing_json(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
        
        response = self.app.post('/api/issues', data='')
        self.assertEqual(response.status_code, 400)

    def test_non_object_json(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
        
        response = self.app.post('/api/issues', json=["array", "instead", "of", "object"])
        self.assertEqual(response.status_code, 400)

    def test_malformed_json(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
        
        response = self.app.post('/api/issues', data='{malformed json}', content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_incorrect_content_type(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
        
        response = self.app.post('/api/issues', data='{"title":"test"}', content_type='text/plain')
        self.assertEqual(response.status_code, 400)

    # --- REQUIRED FIELDS (MISSING) ---

    def test_missing_title(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'category': 'plumbing', 'priority': 'High', 'description': 'Test desc', 'location': 'Test loc'})
        self.assertEqual(response.status_code, 400)

    def test_missing_category(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 'Test title', 'priority': 'High', 'description': 'Test desc', 'location': 'Test loc'})
        self.assertEqual(response.status_code, 400)

    def test_missing_description(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 'Test title', 'category': 'plumbing', 'priority': 'High', 'location': 'Test loc'})
        self.assertEqual(response.status_code, 400)

    def test_missing_location(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 'Test title', 'category': 'plumbing', 'priority': 'High', 'description': 'Test desc'})
        self.assertEqual(response.status_code, 400)

    # --- REQUIRED FIELDS (NON-STRING) ---

    def test_non_string_title(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 123, 'category': 'c', 'priority': 'High', 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    def test_non_string_category(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': True, 'priority': 'High', 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    def test_non_string_description(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': 'c', 'priority': 'High', 'description': ['list'], 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    def test_non_string_location(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': 'c', 'priority': 'High', 'description': 'd', 'location': {'obj': 1}})
        self.assertEqual(response.status_code, 400)

    # --- REQUIRED FIELDS (EMPTY/WHITESPACE) ---

    def test_empty_title(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': '', 'category': 'c', 'priority': 'High', 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    def test_whitespace_title(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': '   ', 'category': 'c', 'priority': 'High', 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    def test_empty_category(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': '', 'priority': 'High', 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 400)
        
    def test_whitespace_category(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': '   ', 'priority': 'High', 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    def test_empty_description(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': 'c', 'priority': 'High', 'description': '', 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    def test_whitespace_description(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': 'c', 'priority': 'High', 'description': '   ', 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    def test_empty_location(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': 'c', 'priority': 'High', 'description': 'd', 'location': ''})
        self.assertEqual(response.status_code, 400)

    def test_whitespace_location(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 'Test title', 'category': 'plumbing', 'priority': 'High', 'description': 'Test desc', 'location': '   '})
        self.assertEqual(response.status_code, 400)

    # --- PRIORITY ---

    @patch('app.issues_collection.insert_one', side_effect=mock_insert_one)
    def test_priority_medium(self, mock_insert):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': 'c', 'priority': 'Medium', 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 201)

    @patch('app.issues_collection.insert_one', side_effect=mock_insert_one)
    def test_priority_low(self, mock_insert):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': 'c', 'priority': 'Low', 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 201)

    def test_priority_unsupported(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': 'c', 'priority': 'Urgent', 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    def test_priority_non_string(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'student'
        response = self.app.post('/api/issues', json={'title': 't', 'category': 'c', 'priority': 1, 'description': 'd', 'location': 'l'})
        self.assertEqual(response.status_code, 400)

    # --- ROLES & IDENTITY ---

    @patch('app.issues_collection.insert_one', side_effect=mock_insert_one)
    def test_owner_id_override(self, mock_insert):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = 'legit_user'
            sess['role'] = 'student'
            sess['name'] = 'Test User'

        response = self.app.post('/api/issues', json={
            'title': 'Test title',
            'category': 'plumbing',
            'priority': 'High',
            'description': 'Test desc',
            'location': 'Test loc',
            'owner_id': 'malicious_user'
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['issue']['owner_id'], 'legit_user')

    def test_unauthorized(self):
        response = self.app.post('/api/issues', json={'title': 'Test title', 'category': 'plumbing', 'priority': 'High', 'description': 'Test desc', 'location': 'Test loc'})
        self.assertEqual(response.status_code, 401)

    def test_wrong_role_admin(self):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['role'] = 'admin'
        response = self.app.post('/api/issues', json={'title': 'Test title', 'category': 'plumbing', 'priority': 'High', 'description': 'Test desc', 'location': 'Test loc'})
        self.assertEqual(response.status_code, 401)

    # --- DB BEHAVIOR & RESPONSES ---

    @patch('app.issues_collection.insert_one', side_effect=mock_insert_one)
    def test_location_preserved(self, mock_insert):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
            sess['name'] = 'Test User'

        response = self.app.post('/api/issues', json={'title': 'Test title', 'category': 'plumbing', 'priority': 'High', 'description': 'Test desc', 'location': ' Library Room 2 '})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['issue']['location'], 'Library Room 2')

    @patch('app.issues_collection.insert_one')
    def test_mongo_failure(self, mock_insert):
        mock_insert.side_effect = pymongo.errors.PyMongoError("DB Down")
        
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
            sess['name'] = 'Test User'

        response = self.app.post('/api/issues', json={'title': 'Test title', 'category': 'plumbing', 'priority': 'High', 'description': 'Test desc', 'location': 'Test loc'})
        self.assertEqual(response.status_code, 500)
        # Verify internal details not exposed
        self.assertNotIn("DB Down", response.json.get('error', ''))

    @patch('app.issues_collection.insert_one', side_effect=mock_insert_one)
    def test_correct_json_response(self, mock_insert):
        with self.app.session_transaction() as sess:
            sess['user_id'] = '123'
            sess['id'] = '123'
            sess['role'] = 'student'
            sess['name'] = 'Test User'

        response = self.app.post('/api/issues', json={'title': 'Test title', 'category': 'plumbing', 'priority': 'High', 'description': 'Test desc', 'location': 'Test loc'})
        self.assertEqual(response.status_code, 201)
        self.assertIn('success', response.json)
        self.assertIn('issue', response.json)
        self.assertEqual(response.json['issue']['title'], 'Test title')

    # --- SIGNUP & PENDING USERS TESTS ---

    @patch('app.users_collection.find_one', return_value=None)
    @patch('app.pending_users_collection.find_one', return_value=None)
    @patch('app.pending_users_collection.insert_one', side_effect=mock_insert_one)
    def test_signup_success(self, mock_insert, mock_pend, mock_user):
        response = self.app.post('/api/signup', json={
            'client_id': 'TEST01',
            'first_name': 'Rahul',
            'last_name': 'Kumar',
            'email': 'rahul@example.com',
            'mobile': '9876543210',
            'role': 'student',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json.get('success'))

    @patch('app.users_collection.find_one', return_value={'student_id': 'TEST01'})
    def test_signup_duplicate_id(self, mock_user):
        response = self.app.post('/api/signup', json={
            'client_id': 'TEST01',
            'first_name': 'Rahul',
            'last_name': 'Kumar',
            'email': 'rahul@example.com',
            'mobile': '9876543210',
            'role': 'student',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json.get('success'))

    @patch('app.pending_users_collection.find')
    def test_get_pending_users_admin(self, mock_find):
        mock_find.return_value.sort.return_value = [
            {
                '_id': 'mocked_id',
                'client_id': 'TEST01',
                'first_name': 'Rahul',
                'last_name': 'Kumar',
                'email': 'rahul@example.com',
                'mobile': '9876543210',
                'role': 'student',
                'created_at': '2026-10-11T00:00:00'
            }
        ]
        with self.app.session_transaction() as sess:
            sess['user_id'] = 'admin'
            sess['role'] = 'admin'

        response = self.app.get('/api/admin/pending_users')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json['pending_users']), 1)

    @patch('app.announcements_collection.find')
    def test_get_announcements(self, mock_find):
        mock_find.return_value.sort.return_value = [
            {
                '_id': 'mock_ann_id',
                'title': 'Campus Notice',
                'message': 'Electricity maintenance tomorrow'
            }
        ]
        response = self.app.get('/api/announcements')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json['announcements']), 1)
        self.assertEqual(response.json['announcements'][0]['title'], 'Campus Notice')

if __name__ == '__main__':
    unittest.main()
