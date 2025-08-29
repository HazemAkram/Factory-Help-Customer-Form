# Factory Help Customer Form

A web-based factory registration form with multi-language support and Google Maps integration.

## Setup

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Email Configuration (Gmail SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD="your-app-password"
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Company Information
COMPANY_EMAIL=contact@yourcompany.com
COMPANY_NAME="Your Company Name"

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```
### 2. Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Copy the API key to `GOOGLE_MAPS_API_KEY`

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

## Features

- Multi-language support (English, Arabic, German, Spanish, French, Turkish, Russian, Hindi)
- Google Maps integration for location selection
- Email notifications
- Form validation
- Responsive design

## Supported Languages

- 🇺🇸 English (`en`)
- 🇸🇦 Arabic (`ar`)
- 🇩🇪 German (`de`)
- 🇪🇸 Spanish (`es`)
- 🇫🇷 French (`fr`)
- 🇹🇷 Turkish (`tr`)
- 🇷🇺 Russian (`ru`)
- 🇮🇳 Hindi (`in`)
- 🇨🇳 Chinese (`zh`)

## File Structure

```
├── app.py                 # Main Flask application
├── index.html            # Main form page
├── script.js             # Frontend JavaScript
├── styles.css            # CSS styles
├── .env                  # Environment variables (create this)
├── requirements.txt      # Python dependencies
└── translations/         # Language files
    ├── en.json          # English
    ├── ar.json          # Arabic
    ├── de.json          # German
    ├── es.json          # Spanish
    ├── fr.json          # French
    ├── tr.json          # Turkish
    ├── ru.json          # Russian
    ├── in.json          # Hindi
    └── zh.json          # Chinese
```

## Important Notes

- Never commit your `.env` file to version control
- Keep your API keys and passwords secure
- The Gmail app password is different from your regular Gmail password
- Make sure all required environment variables are set before running the application

