# Resume Parser
import cohere
import os
import pymongo
import PyPDF2
import json
COHERE_API = os.getenv("COHERE_API")
MONGO = os.getenv("MONGO")
co = cohere.ClientV2(COHERE_API)
mongo_client = pymongo.MongoClient(MONGO)
db = mongo_client["mesh"]


def parse_resume(resume_file, model='command'):
    # Read resume text
    if resume_file.endswith('.pdf'):
        with open(resume_file, 'rb') as file:
            pdf = PyPDF2.PdfReader(file)
            resume_text = ""
            for page in range(len(pdf.pages)):
                resume_text += pdf.pages[page].extract_text()
    else:
        with open(resume_file, 'r') as file:
            resume_text = file.read()
    
    # Define prompts
    name_prompt = f"Extract the person's first and last name from the following resume. Output the full name without any additional text:\n\n{resume_text}\n\nName:"
    skills_prompt = f"Extract the key skills from the following resume. Output a comma-separated list without any additional text:\n\n{resume_text}\n\nSkills:"
    experience_prompt = f"List the person's key experiences from the following resume Output a comma-separated list without any additional text:\n\n{resume_text}\n\nExperience:"
    tags_prompt = f"Generate key tags for this person based on their resume Output a comma-separated list without any additional text:\n\n{resume_text}\n\nTags:"
    summary_prompt = f"Write a single sentence background summary for the following resume Output a comma-separated list without any additional text:\n\n{resume_text}\n\nSummary:"
    school_prompt = f"Extract the person's University. Output the name of the school without any additional text:\n\n{resume_text}\n\nSummary:"

    # Generate responses
    responses = {
        "name": co.generate(model=model, prompt=name_prompt, max_tokens=10).generations[0].text.strip(),
        "skills": co.generate(model=model, prompt=skills_prompt, max_tokens=50).generations[0].text.strip(),
        "experience": co.generate(model=model, prompt=experience_prompt, max_tokens=100).generations[0].text.strip(),
        "tags": co.generate(model=model, prompt=tags_prompt, max_tokens=50).generations[0].text.strip(),
        "background": co.generate(model=model, prompt=summary_prompt, max_tokens=100).generations[0].text.strip(),
        "school": co.generate(model=model, prompt=school_prompt, max_tokens=50).generations[0].text.strip()
    }

    # Format as JSON
    parsed_resume = {
        "name": responses["name"],
        "skills": responses["skills"].split(", "),
        "experience": responses["experience"].split(","),
        "tags": responses["tags"].split(", "),
        "background": responses["background"],
        "school": responses["school"]
    }

    return parsed_resume

def make_serializable(user):
        if "_id" in user:
            user["_id"] = str(user["_id"])  # Convert ObjectId to string
        return user

#semantic user search
def search_user(query, school):
    os.makedirs('resources', exist_ok=True)
    
    # Convert each user document to a JSON-serializable format
    user_list_serializable = get_users(school)
    user_list_str = [json.dumps(user) for user in user_list_serializable]
    results = co.rerank(query=query, documents=user_list_str, model='rerank-english-v3.0')
    hits = [user_list_serializable[hit.index] for hit in results.results]
    
    # Use json.dumps to return the list of JSON objects
    json_data = json.dumps(hits, indent=4)
    return json_data

def get_users(school):
    # Get all users from db
    if school:
        collection = db["users"].find({"school": school})
    else:
        collection = db["users"].find({})
        # Convert each user document to a JSON-serializable format
    user_list = [user for user in collection]
    user_list_serializable = [make_serializable(user) for user in user_list]
    return user_list_serializable

# create user in mongodb
def create_user(user_json):
    collection = db["users"]
    #check if user exits, and if it doesnt insert, if it does then update the collection
    if collection.count_documents({"name": user_json["name"]}) == 0:
        collection.insert_one(user_json)
    else:
        collection.update_one({"name": user_json["name"]}, {"$set": user_json})