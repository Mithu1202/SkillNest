from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from flask import Flask, request, jsonify


# Initialize Flask app
app = Flask(__name__)


@app.route('/recommend', methods=['POST'])
def text_recommendation():
    data = request.json
    print("======================================================================================== \n")
    
    print("Received data:", data)
    documents = data.get("documents", [])
    new_text = data.get("new_text", "")
    top_k = data.get("top_k", 3)
    # Extract raw text and metadata
    texts = []
    doc_info = []  # List of dicts: {'index': ..., 'id': ..., 'value': ...}
    
    for idx, doc in enumerate(documents):
        if isinstance(doc, dict) and 'value' in doc:
            text = doc['value']
            doc_info.append({
                'index': idx,
                'id': doc.get('id'),
                'value': text
            })
            texts.append(text)
        elif isinstance(doc, str):
            doc_info.append({
                'index': idx,
                'id': None,
                'value': doc
            })
            texts.append(doc)
        else:
            raise ValueError(f"Invalid document format at index {idx}")

    # Vectorize text
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(texts)

    # Fit KNN model
    knn = NearestNeighbors(n_neighbors=min(top_k, len(texts)), metric='cosine')
    knn.fit(tfidf_matrix)

    # Transform new input text
    new_vec = vectorizer.transform([new_text])

    # Get top-k similar documents
    distances, indices = knn.kneighbors(new_vec)

    # Build final result with similarity
    results = []
    for i in range(len(indices[0])):
        idx = indices[0][i]
        similarity = 1 - distances[0][i]
        result = doc_info[idx].copy()
        result['similarity'] = similarity
        results.append(result)
    print("======================================================================================== \n")
    print("Top K similar documents: \n", results)
    return jsonify(results)



if __name__ == "__main__":
    app.run(debug=True)

documents = [
    {"id": "doc_1", "value": "Machine learning is a subset of artificial intelligence that deals with data-driven algorithms."},
    {"id": "doc_2", "value": "Deep learning involves neural networks and is used in image and speech recognition."},
    {"id": "doc_3", "value": "Scikit-learn is a popular machine learning library in Python for classification and regression."},
    {"id": "doc_4", "value": "Cloud computing provides scalable computing resources over the internet."},
    {"id": "doc_5", "value": "Big Data technologies include Hadoop and Spark for handling large datasets."},
    {"id": "doc_6", "value": "Cybersecurity focuses on protecting networks and data from malicious attacks."},
    {"id": "doc_7", "value": "Natural Language Processing is used to process and analyze human language."},
    {"id": "doc_8", "value": "Web development involves frontend and backend technologies like HTML, CSS, Flask, and Django."},
    {"id": "doc_9", "value": "DevOps integrates development and operations using CI/CD and automation tools."},
    {"id": "doc_10", "value": "Database systems use SQL and NoSQL to store and retrieve structured and unstructured data."}
]


# new_text = "Machine learning is a subset of artificial intelligence that deals with data-driven algorithms."
# df = pd.DataFrame(text_recommendation(documents, new_text))
# print(df)