import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List
from flask import Flask, request, jsonify, send_from_directory, send_file, Response
from flask_cors import CORS
from flask_mail import Mail, Message
import csv
import json
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).resolve().parent
STATIC_ROOT = ROOT
SUBMISSIONS_DIR = ROOT / "submissions"
CSV_PATH = SUBMISSIONS_DIR / "factory_registrations.csv"
JSONL_PATH = SUBMISSIONS_DIR / "factory_registrations.jsonl"

SUBMISSIONS_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder=str(STATIC_ROOT), static_url_path="")
CORS(app, resources={r"/v2/*": {"origins": "*"}})

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'false').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', '')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@yourcompany.com')

# Company email for notifications
COMPANY_EMAIL = os.getenv('COMPANY_EMAIL', 'admin@yourcompany.com')
COMPANY_NAME = os.getenv('COMPANY_NAME', 'Your Company Name')

mail = Mail(app)


@app.route("/")
def index():
	index_path = STATIC_ROOT / "index.html"
	if not index_path.exists():
		return ("index.html not found", 404)
	html = index_path.read_text(encoding="utf-8")
	api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
	html = html.replace("__GOOGLE_MAPS_API_KEY__", api_key)
	return Response(html, mimetype="text/html")


@app.route("/<path:filename>")
def static_passthrough(filename: str):
	file_path = STATIC_ROOT / filename
	if file_path.exists() and file_path.is_file():
		return send_from_directory(STATIC_ROOT, filename)
	return ("Not found", 404)


def normalize_payload(payload: Dict) -> Dict:
	# Ensure values are strings for CSV; keep as-is where appropriate
	normalized = {}
	for key, value in payload.items():
		if value is None:
			normalized[key] = ""
		elif isinstance(value, (dict, list)):
			normalized[key] = json.dumps(value, ensure_ascii=False)
		else:
			normalized[key] = str(value)
	return normalized


def write_jsonl(record: Dict) -> None:
	with JSONL_PATH.open("a", encoding="utf-8") as f:
		f.write(json.dumps(record, ensure_ascii=False) + "\n")


def write_csv(record: Dict) -> None:
	# Create file with headers if not exists; add new headers if payload evolves
	exists = CSV_PATH.exists()
	fieldnames: List[str]

	if exists:
		# Read existing header
		with CSV_PATH.open("r", encoding="utf-8", newline="") as f:
			reader = csv.reader(f)
			try:
				existing_header = next(reader)
			except StopIteration:
				existing_header = []
		fieldnames = list(existing_header)
		# Merge any new keys
		for key in record.keys():
			if key not in fieldnames:
				fieldnames.append(key)
		# If header changed, rewrite file with new header
		if fieldnames != existing_header:
			rows = []
			with CSV_PATH.open("r", encoding="utf-8", newline="") as f:
				reader = csv.DictReader(f)
				for row in reader:
					rows.append(row)
			with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
				writer = csv.DictWriter(f, fieldnames=fieldnames)
				writer.writeheader()
				for row in rows:
					writer.writerow({k: row.get(k, "") for k in fieldnames})
		else:
			# Header didn't change, just append the new record
			with CSV_PATH.open("a", encoding="utf-8", newline="") as f:
				writer = csv.DictWriter(f, fieldnames=fieldnames)
				writer.writerow({k: record.get(k, "") for k in fieldnames})
	else:
		# File doesn't exist, create it with headers
		fieldnames = list(record.keys())
		with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
			writer = csv.DictWriter(f, fieldnames=fieldnames)
			writer.writeheader()
			writer.writerow({k: record.get(k, "") for k in fieldnames})


def create_company_notification_email(registration_data: Dict) -> str:
	"""Create HTML email content for company notification"""
	html_content = f"""
	<html>
	<head>
		<style>
			body {{ font-family: Arial, sans-serif; margin: 20px; }}
			.header {{ background-color: #FF5100; color: white; padding: 20px; text-align: center; }}
			.content {{ padding: 20px; }}
			.section {{ margin: 20px 0; padding: 15px; border-left: 4px solid #FF5100; background-color: #f8f9fa; }}
			.field {{ margin: 10px 0; }}
			.label {{ font-weight: bold; color: #333; }}
			.value {{ color: #666; }}
			.footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
		</style>
	</head>
	<body>
		<div class="header">
			<h1>New Factory Registration</h1>
			<p>Submission ID: {registration_data.get('submissionId', 'N/A')}</p>
		</div>
		
		<div class="content">
			<div class="section">
				<h2>Factory Information</h2>
				<div class="field">
					<span class="label">Factory Name:</span>
					<span class="value">{registration_data.get('factoryName', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Country:</span>
					<span class="value">{registration_data.get('country', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">City:</span>
					<span class="value">{registration_data.get('city', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Address:</span>
					<span class="value">{registration_data.get('detailedAddress', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Email:</span>
					<span class="value">{registration_data.get('factoryEmail', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Phone:</span>
					<span class="value">{registration_data.get('landlinePhone', 'N/A')}</span>
				</div>
			</div>
			
			<div class="section">
				<h2>Factory Owner Information</h2>
	"""
	
	# Add owner information
	owner_index = 1
	while f'ownerName_{owner_index}' in registration_data:
		owner_name = registration_data.get(f'ownerName_{owner_index}', 'N/A')
		owner_email = registration_data.get(f'ownerEmail_{owner_index}', 'N/A')
		owner_mobile = registration_data.get(f'ownerMobile_{owner_index}', 'N/A')
		html_content += f"""
				<div class="field">
					<span class="label">Owner {owner_index}:</span>
					<span class="value">{owner_name}</span>
				</div>
				<div class="field">
					<span class="label">Email:</span>
					<span class="value">{owner_email}</span>
				</div>
				<div class="field">
					<span class="label">Mobile:</span>
					<span class="value">{owner_mobile}</span>
				</div>
		"""
		owner_index += 1
	
	html_content += f"""
			</div>
			
			<div class="section">
				<h2>Spare Parts Manager</h2>
				<div class="field">
					<span class="label">Name:</span>
					<span class="value">{registration_data.get('sparePartsManagerName', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Mobile:</span>
					<span class="value">{registration_data.get('sparePartsManagerMobile', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Email:</span>
					<span class="value">{registration_data.get('sparePartsManagerEmail', 'N/A')}</span>
				</div>
			</div>
			
			<div class="section">
				<h2>Industrial Activity</h2>
				<div class="field">
					<span class="label">Industry Field:</span>
					<span class="value">{registration_data.get('industryField', 'N/A')}</span>
				</div>
	"""
	
	# Add production lines
	production_index = 1
	while f'productionLine_{production_index}' in registration_data:
		production_line = registration_data.get(f'productionLine_{production_index}', 'N/A')
		brand_name = registration_data.get(f'brandName_{production_index}', 'N/A')
		made_in = registration_data.get(f'madeIn_{production_index}', 'N/A')
		html_content += f"""
				<div class="field">
					<span class="label">Production Line {production_index}:</span>
					<span class="value">{production_line} - {brand_name} (Made in: {made_in})</span>
				</div>
		"""
		production_index += 1
	
	html_content += f"""
			</div>
			
			<div class="section">
				<h2>Employee Information</h2>
				<div class="field">
					<span class="label">Employee Name:</span>
					<span class="value">{registration_data.get('employeeName', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Position/Title:</span>
					<span class="value">{registration_data.get('employeePosition', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Employee Email:</span>
					<span class="value">{registration_data.get('employeeEmail', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Employee Phone:</span>
					<span class="value">{registration_data.get('employeePhone', 'N/A')}</span>
				</div>
			</div>
			
			<div class="section">
				<h2>Submission Details</h2>
				<div class="field">
					<span class="label">Submission Date:</span>
					<span class="value">{registration_data.get('receivedAt', 'N/A')}</span>
				</div>
			</div>
		</div>
		
		<div class="footer">
			<p>This is an automated notification from your factory registration system.</p>
			<p>© {datetime.now().year} {COMPANY_NAME}. All rights reserved.</p>
		</div>
	</body>
	</html>
	"""
	return html_content


def create_customer_confirmation_email(registration_data: Dict) -> str:
	"""Create HTML email content for customer confirmation"""
	html_content = f"""
	<html>
	<head>
		<style>
			body {{ font-family: Arial, sans-serif; margin: 20px; }}
			.header {{ background-color: #FF5100; color: white; padding: 20px; text-align: center; }}
			.content {{ padding: 20px; }}
			.section {{ margin: 20px 0; padding: 15px; border-left: 4px solid #FF5100; background-color: #f8f9fa; }}
			.field {{ margin: 10px 0; }}
			.label {{ font-weight: bold; color: #333; }}
			.value {{ color: #666; }}
			.footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
			.thank-you {{ text-align: center; font-size: 18px; color: #22c55e; margin: 20px 0; }}
		</style>
	</head>
	<body>
		<div class="header">
			<h1>🎉 Registration Successful!</h1>
			<h2>Factory Registration Confirmation</h2>
			<p> <strong>Submission ID:</strong> {registration_data.get('submissionId', 'N/A')}</p>
		</div>
		
		<div class="content">
			<div class="thank-you">
				<h2>🌟 Welcome to Our Manufacturing Network!</h2>
				<p>Dear Valued Customer,</p>
				<p>We have successfully received your factory registration information. Our team will review your submission and contact you As Soon As Possible.</p>
			</div>
			
			<div class="section">
				<h2>📋 Registration Summary</h2>
				<div class="field">
					<span class="label">Factory Name:</span>
					<span class="value">{registration_data.get('factoryName', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Location:</span>
					<span class="value">{registration_data.get('city', 'N/A')}, {registration_data.get('country', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Industry:</span>
					<span class="value">{registration_data.get('industryField', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Production Lines:</span>
					<span class="value">
						{', '.join([f"{registration_data.get(f'productionLine_{i}', '')} ({registration_data.get(f'brandName_{i}', '')}, Made in: {registration_data.get(f'madeIn_{i}', '')})" for i in range(1, 10) if registration_data.get(f'productionLine_{i}')])}
					</span>
				</div>
				<div class="field">
					<span class="label">Contact Email:</span>
					<span class="value">{registration_data.get('factoryEmail', 'N/A')}</span>
				</div>
			</div>
			
			<div class="section">
				<h2>⏰ Next Steps</h2>
				<ol>
					<li>Our team will review your registration As Soon As Possible</li>
					<li>We will contact you via email or phone to discuss next steps</li>
					<li>You may be asked to provide additional documentation if needed</li>
					<li>Upon approval, you will receive access to our platform</li>
				</ol>
			</div>
			
			<div class="section">
				<h2>👤 Form Completed By</h2>
				<div class="field">
					<span class="label">Employee Name:</span>
					<span class="value">{registration_data.get('employeeName', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Position/Title:</span>
					<span class="value">{registration_data.get('employeePosition', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Employee Email:</span>
					<span class="value">{registration_data.get('employeeEmail', 'N/A')}</span>
				</div>
				<div class="field">
					<span class="label">Employee Phone:</span>
					<span class="value">{registration_data.get('employeePhone', 'N/A')}</span>
				</div>
			</div>
			
			<div class="section">
				<h2>📞 Contact Information</h2>
				<p>If you have any questions about your registration, please contact us:</p>
				<p><strong>Email:</strong> {COMPANY_EMAIL}</p>
				<p><strong>Company:</strong> {COMPANY_NAME}</p>
			</div>
		</div>
		
		<div class="footer">
			<p>🤝 Thank you for choosing {COMPANY_NAME}!</p>
			<p>© {datetime.now().year} {COMPANY_NAME}. All rights reserved.</p>
			<p><small>This is an automated email. Please do not reply to this email.</small></p>
		</div>
	</body>
	</html>
	"""
	return html_content


def send_emails(registration_data: Dict) -> Dict:
	"""Send notification emails to company and customer"""
	email_results = {
		'company_email_sent': False,
		'customer_email_sent': False,
		'errors': []
	}
	
	try:
		# Send email to company
		company_subject = f"New Factory Registration: {registration_data.get('factoryName', 'Unknown Factory')}"
		company_html = create_company_notification_email(registration_data)
		
		company_msg = Message(
			subject=company_subject,
			recipients=[COMPANY_EMAIL],
			html=company_html
		)
		
		mail.send(company_msg)
		email_results['company_email_sent'] = True
		
	except Exception as e:
		email_results['errors'].append(f"Company email error: {str(e)}")
	
	try:
		# Send confirmation email to customer
		customer_email = registration_data.get('factoryEmail')
		if customer_email:
			customer_subject = f"Factory Registration Confirmation - {registration_data.get('submissionId', 'N/A')}"
			customer_html = create_customer_confirmation_email(registration_data)
			
			customer_msg = Message(
				subject=customer_subject,
				recipients=[customer_email],
				html=customer_html
			)
			
			mail.send(customer_msg)
			email_results['customer_email_sent'] = True
		else:
			email_results['errors'].append("No customer email provided")
			
	except Exception as e:
		email_results['errors'].append(f"Customer email error: {str(e)}")
	
	return email_results


@app.route("/v2/factory-registration", methods=["POST"])
def factory_registration():
	if not request.is_json:
		return jsonify({"success": False, "message": "Expected JSON body"}), 400

	payload = request.get_json(silent=True) or {}

	# Minimal validation aligned with frontend required fields
	required = ["factoryName", "country", "factoryEmail", "detailedAddress"]
	missing = [name for name in required if not payload.get(name)]
	if missing:
		return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing)}"}), 422

	record = {
		"receivedAt": datetime.utcnow().isoformat() + "Z",
		"ip": request.headers.get("X-Forwarded-For", request.remote_addr),
		"userAgent": request.headers.get("User-Agent", ""),
		**payload,
	}

	normalized = normalize_payload(record)

	# Persist JSONL and CSV
	write_jsonl(normalized)
	write_csv(normalized)
	
	# Send notification emails
	email_results = send_emails(normalized)
	
	# Prepare response
	response_data = {
		"success": True, 
		"message": "Registration saved", 
		"submissionId": payload.get("submissionId"),
		"emails": email_results
	}
	
	return jsonify(response_data), 201


if __name__ == "__main__":
	port = int(os.environ.get("PORT", 5000))
	app.run(host="0.0.0.0", port=port, debug=True)