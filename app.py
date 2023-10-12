from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, get_jwt_identity, jwt_required
)
import bcrypt

app = Flask(__name__)
CORS(app)
app.config['MONGO_URI'] = 'mongodb://localhost:27017/task_manager'
app.config['JWT_SECRET_KEY'] = 'ghghghghghghgththteehhnskr'  # Change this to a strong, random secret key
mongo = MongoClient(app.config['MONGO_URI'])
db = mongo.task_manager

jwt = JWTManager(app)

# Task Management (Create, Read, Update, Delete)
@app.route('/tasks', methods=['POST'], endpoint='create_task')
@jwt_required()
def create_task():
    task_data = request.get_json()
    if 'title' not in task_data or 'description' not in task_data:
        return jsonify({'message': 'Title and description are required'}), 400

    user_id = get_jwt_identity()
    new_task = {
        'title': task_data['title'],
        'description': task_data['description'],
        'due_date': task_data.get('due_date'),
        'priority': task_data.get('priority'),
        'completed': False,
        'category': task_data.get('category'),
        'user_id': user_id
    }

    result = db.tasks.insert_one(new_task)

    if result.inserted_id:
        new_task['_id'] = str(result.inserted_id)
        return jsonify(new_task), 201
    else:
        return jsonify({'message': 'Task creation failed'}), 500

@app.route('/tasks/<task_id>', methods=['PUT'], endpoint='update_task')
@jwt_required()
def update_task(task_id):
    task_data = request.get_json()
    task = db.tasks.find_one({'_id': ObjectId(task_id)})

    if not task:
        return jsonify({'message': 'Task not found'}), 404

    if str(task['user_id']) != get_jwt_identity():
        return jsonify({'message': 'Unauthorized'}), 403

    # Use update_one instead of update
    result = db.tasks.update_one(
        {'_id': ObjectId(task_id)},
        {'$set': task_data}
    )

    if result.matched_count == 1:
        return jsonify({'message': 'Task updated successfully'}), 200
    else:
        return jsonify({'message': 'Task update failed'}), 500


@app.route('/tasks/<task_id>', methods=['DELETE'], endpoint='delete_task')
@jwt_required()
def delete_task(task_id):
    task = db.tasks.find_one({'_id': ObjectId(task_id)})

    if not task:
        return jsonify({'message': 'Task not found'}), 404

    if str(task['user_id']) != get_jwt_identity():
        return jsonify({'message': 'Unauthorized'}), 403

    result = db.tasks.delete_one({'_id': ObjectId(task_id)})

    if result.deleted_count == 0:
        return jsonify({'message': 'Task not found'}), 404
    else:
        return jsonify({'message': 'Task deleted'}), 200

@app.route('/tasks/<task_id>/complete', methods=['PUT'], endpoint='complete_task')
@jwt_required()
def complete_task(task_id):
    task_data = request.get_json()
    task = db.tasks.find_one({'_id': ObjectId(task_id)})

    if not task:
        return jsonify({'message': 'Task not found'}), 404

    if str(task['user_id']) != get_jwt_identity():
        return jsonify({'message': 'Unauthorized'}), 403

    db.tasks.update_one(
        {'_id': ObjectId(task_id)},
        {'$set': {'completed': task_data.get('completed', False)}
    })

    return jsonify({'message': 'Task marked as complete'}), 200

@app.route('/tasks', methods=['GET'], endpoint='get_tasks')
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    tasks = list(db.tasks.find({'user_id': user_id}))

    # Convert ObjectId to string
    for task in tasks:
        task['_id'] = str(task['_id'])

    # Include the "completed" status in the task objects
    tasks_with_completed = []
    for task in tasks:
        completed = task.get('completed', False)
        task['completed'] = completed
        tasks_with_completed.append(task)

    return jsonify(tasks_with_completed), 200


# User Registration
@app.route('/register', methods=['POST'])
def register():
    user_data = request.get_json()
    username = user_data.get('username')
    password = user_data.get('password')
    email = user_data.get('email')
    # Check if the username is already taken
    existing_user = db.users.find_one({'username': username})
    if existing_user:
        return jsonify({'message': 'Username is already taken'}), 400

    # Securely hash the user's password using bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    new_user = {
        'username': username,
        'password': hashed_password.decode('utf-8'),
        'email': email
    }
    db.users.insert_one(new_user)

    return jsonify({'message': 'User registered successfully'}), 201

# User Login with JWT
@app.route('/login', methods=['POST'])
def login():
    login_data = request.get_json()
    username = login_data.get('username')
    password = login_data.get('password')

    user = db.users.find_one({'username': username})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        # Generate an access token and return it
        access_token = create_access_token(identity=username)
        return jsonify({'access_token': access_token, 'message': 'Login successful'}), 200

    return jsonify({'message': 'Invalid username or password'}, 401)

if __name__ == '__main__':
    app.run(debug=True)
