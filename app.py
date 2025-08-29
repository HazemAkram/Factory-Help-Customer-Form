import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List
from flask import Flask, request, jsonify, send_from_directory, send_file, Response
from flask_cors import CORS
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
CORS(app, resources={r"/api/*": {"origins": "*"}})


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
		fieldnames = list(record.keys())

	# Append the new record
	with CSV_PATH.open("a", encoding="utf-8", newline="") as f:
		writer = csv.DictWriter(f, fieldnames=fieldnames)
		if not exists:
			writer.writeheader()
		writer.writerow({k: record.get(k, "") for k in fieldnames})


@app.route("/api/factory-registration", methods=["POST"])
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

	return jsonify({"success": True, "message": "Registration saved", "submissionId": payload.get("submissionId")}), 201


if __name__ == "__main__":
	port = int(os.environ.get("PORT", 5000))
	app.run(host="0.0.0.0", port=port, debug=True)
