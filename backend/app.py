
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import sqlite3  # Import the sqlite3 module
import os
from db_config import get_db_connection
from flask_cors import CORS
from prometheus_flask_exporter import PrometheusMetrics

from flask import send_from_directory


app = Flask(__name__)

# Define the allowed file types
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = './uploads'  # Directory where images will be saved
CORS(app)
metrics = PrometheusMetrics(app)
bcrypt = Bcrypt(app) 
hashed_password = generate_password_hash("your_password")


app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER




# Ensure that the folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Function to check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS




@app.route("/")
def home():
    return jsonify({"message": "Welcome to the College Service App"}), 200  # ✅ Return JSON, not plain text



@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/services', methods=['GET'])
def get_services():
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row  # Ensures rows are returned as dictionaries
    cursor = conn.cursor()
    
    cursor.execute("SELECT service_id, service_name FROM services")
    rows = cursor.fetchall()
    
    services = [{"service_id": row["service_id"], "service_name": row["service_name"]} for row in rows]
    
    conn.close()
    return jsonify(services)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')  # Default role is student
    service_id = data.get('service_id')

    if not name or not email or not password:
        return jsonify({"error": "Name, Email, and Password are required"}), 400

    # ✅ 🚀 🚨 THE FINAL BULLETPROOF LOCK 🚨
    if role == 'admin':
        return jsonify({"error": "You CANNOT register as admin!"}), 403

    # ✅ Check if email already exists
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        conn.close()
        return jsonify({"error": "Email already registered!"}), 409

    # ✅ Encrypt the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # ✅ Insert user
    cursor.execute(
        "INSERT INTO users (name, email, password_hash, role, service_id) VALUES (?, ?, ?, ?, ?)",
        (name, email, hashed_password, role, service_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "User registered successfully!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT password_hash, role, service_id FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Invalid email or password"}), 401

    stored_hash, role, service_id = user  # Extract values

    print(f"User Role: {role}")  # Debugging

    if not bcrypt.check_password_hash(stored_hash, password):
        conn.close()
        return jsonify({"error": "Invalid email or password"}), 401

    # Fetch service name if service_staff
    service_name = None
    if role == "service_staff" and service_id:
        cursor.execute("SELECT service_name FROM services WHERE service_id = ?", (service_id,))
        service = cursor.fetchone()
        service_name = service[0] if service else None

    conn.close()

    return jsonify({
        "message": "Login successful!",
        "role": role,
        "service_id": service_id,
        "service_name": service_name
    }), 200


@app.route('/student-dashboard/create-ticket', methods=['POST'])
def create_ticket():
    data = request.form  # Access form data
    user_id = data.get("user_id")
    service_id = data.get("service_id")
    description = data.get("description")
    
    # Handle image upload (optional)
    image = request.files.get("image")  # 'image' is the form field name for the file upload
    
    if image and allowed_file(image.filename):
        filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(image_path)
    else:
        image_path = None  # If no image or invalid file type

    if not user_id or not service_id or not description:
        return jsonify({"error": "user_id, service_id, and description are required"}), 400

    # Database code (same as before)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO tickets (user_id, service_id, status, description, image_path, created_at, updated_at)
            VALUES (?, ?, 'Open', ?, ?, ?, ?)
        """, (user_id, service_id, description, image_path, datetime.utcnow(), datetime.utcnow()))

        conn.commit()
        ticket_id = cursor.lastrowid
        conn.close()

        return jsonify({"message": "Ticket created successfully!", "ticket_id": ticket_id}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    

@app.route('/student-dashboard/my-tickets/<int:student_id>', methods=['GET'])
def get_student_tickets(student_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ticket_id, service_id, description, status, created_at, image_path  -- Include image_path
        FROM tickets WHERE user_id = ?  
        ORDER BY created_at DESC
    """, (student_id,))

    tickets = cursor.fetchall()
    conn.close()

    if not tickets:
        return jsonify({"message": "No tickets found."}), 404

    # Backend URL where images are stored
    base_url = "http://localhost:5000/uploads/"

    ticket_list = [
        {
            "ticket_id": t[0],
            "service_id": t[1],
            "description": t[2],
            "status": t[3],
            "created_at": t[4],
            "image_url": base_url + os.path.basename(t[5]) if t[5] else None  # Convert local path to URL
        }
        for t in tickets
    ]

    return jsonify(ticket_list), 200

@app.route('/service-dashboard/update-ticket-status/<int:ticket_id>', methods=['PUT'])
def update_ticket_status(ticket_id):
    data = request.json  # Get JSON request body
    new_status = data.get("status")

    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE tickets SET status = ?, updated_at = ?
            WHERE ticket_id = ?
        """, (new_status, datetime.utcnow(), ticket_id))

        if cursor.rowcount == 0:
            return jsonify({"error": "Ticket not found"}), 404

        conn.commit()
        conn.close()

        return jsonify({"message": "Ticket status updated successfully!"}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ Get Tickets with image_path
@app.route('/service-dashboard/tickets/<int:service_id>', methods=['GET'])
def get_service_tickets(service_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ticket_id, user_id, description, status, created_at, image_path
        FROM tickets WHERE service_id = ?
        ORDER BY created_at DESC
    """, (service_id,))

    tickets = cursor.fetchall()
    conn.close()

    if not tickets:
        return jsonify({"message": "No tickets found for this service."}), 404
    
    # ✅ Return tickets with `image_path`

    base_url = "http://localhost:5000/uploads/"
    ticket_list = [
        {
            "ticket_id": t[0],
            "user_id": t[1],
            "description": t[2],
            "status": t[3],
            "created_at": t[4],
            "image_url": base_url + os.path.basename(t[5]) if t[5] else None  # Convert local path to URL
        }
        for t in tickets
    ]

    return jsonify(ticket_list), 200

@app.route('/admin-dashboard/tickets', methods=['GET'])
def get_all_tickets():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT t.ticket_id, t.user_id, s.service_id, s.service_name, 
               t.description, t.status, t.created_at, t.image_path
        FROM tickets t
        JOIN services s ON t.service_id = s.service_id
        ORDER BY t.created_at DESC
    """)

    tickets = cursor.fetchall()
    conn.close()

    if not tickets:
        return jsonify({"message": "No tickets found."}), 404
    
    ticket_list = [
        {
            "ticket_id": t[0],
            "user_id": t[1],
            "service_id": t[2],
            "service_name": t[3],  # ✅ Adding Service Name
            "description": t[4],
            "status": t[5],
            "created_at": t[6],
            "image_path": t[7] if t[7] else None
            
        }
        for t in tickets
    ]

    return jsonify(ticket_list), 200

# ✅ Get tickets by specific service (for dropdown filter)
@app.route('/admin-dashboard/tickets/<int:service_id>', methods=['GET'])
def get_tickets_by_service(service_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ticket_id, user_id, description, status, created_at, image_path
        FROM tickets WHERE service_id = ?
        ORDER BY created_at DESC
    """, (service_id,))

    tickets = cursor.fetchall()
    conn.close()

    if not tickets:
        return jsonify({"message": "No tickets found for this service."}), 404

    ticket_list = [
        {
            "ticket_id": t[0],
            "user_id": t[1],
            "description": t[2],
            "status": t[3],
            "created_at": t[4],
            "image_path": t[5] if t[5] else None
        }
        for t in tickets
    ]

    return jsonify(ticket_list), 200

@app.route('/admin/update-ticket/<int:ticket_id>', methods=['PUT'])
def admin_update_ticket(ticket_id):
    data = request.json  # Get JSON request body
    new_status = data.get("status")
    new_service_type = data.get("service_type")  # Example: allow admin to change service type as well
    new_description = data.get("description")  # Allow description update

    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(""" 
            UPDATE tickets SET 
                status = ?, 
                service_type = ?, 
                description = ?, 
                updated_at = ?
            WHERE ticket_id = ? 
        """, (new_status, new_service_type, new_description, datetime.utcnow(), ticket_id))

        if cursor.rowcount == 0:
            return jsonify({"error": "Ticket not found"}), 404

        conn.commit()
        conn.close()

        return jsonify({"message": f"Ticket {ticket_id} updated successfully by admin!"}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/admin-dashboard/delete-ticket/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM tickets WHERE ticket_id = ?", (ticket_id,))
        if cursor.rowcount == 0:
            return jsonify({"error": "Ticket not found"}), 404

        conn.commit()
        conn.close()

        return jsonify({"message": "Ticket deleted successfully!"}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
