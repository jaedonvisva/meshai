from utils import *
from flask import *
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route('/')
def home():
    return "hello world"

@app.route('/api/parse', methods=['POST'])
def parse_resume():
    resume_file = request.files['resume']
    parsed_resume = parse_resume(resume_file)
    create_user(parsed_resume)
    return redirect('/')

@app.route('/api/search', methods=['POST'])
def search():
    print('got search request')
    data = request.json
    search_query = data.get('query', "")
    results = json.loads(search_user(search_query, "University of Waterloo"))
    return results


@app.get('/api/all_users')
def return_all_users():
    all_users = get_users("")
    return all_users


if __name__ == '__main__':
    app.run(debug=True)