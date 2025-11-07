from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

# Download NLTK data (only first time)
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Initialize Flask
app = Flask(__name__, static_folder="static")
CORS(app)  # allows frontend JS to call backend API

# Load model and vectorizer
with open('text_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

# Preprocessing setup
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess(text):
    tokens = word_tokenize(text.lower())
    tokens = [t for t in tokens if t.isalpha()]
    tokens = [t for t in tokens if t not in stop_words]
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    clean_text = " ".join(tokens)
    return tokens, clean_text

# Serve the HTML UI
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# API endpoint to process messages
@app.route('/get', methods=['GET'])
def get_response():
    user_msg = request.args.get('msg', '')
    tokens, clean_text = preprocess(user_msg)
    X = vectorizer.transform([clean_text])
    prediction = model.predict(X)[0]

    return jsonify({
        'tokens': tokens,
        'category': prediction
    })

if __name__ == '__main__':
    app.run(debug=True)
