from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util

# Initialize Flask app and SentenceTransformer
app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')  # Lightweight semantic model

@app.route('/recommend', methods=['POST'])
def text_recommendation():
    data = request.json
    print("======================================================================================== \n")
    print("Received data:", data)

    documents = data.get("documents", [])
    new_text = data.get("new_text", "")
    top_k = data.get("top_k", 3)

    texts = []
    doc_info = []

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

    # Semantic vectorization (replaces TF-IDF)
    doc_embeddings = model.encode(texts, convert_to_tensor=True)
    new_embedding = model.encode(new_text, convert_to_tensor=True)

    # Compute cosine similarity
    similarities = util.cos_sim(new_embedding, doc_embeddings)[0]  # Shape: (num_documents,)
    top_k = min(top_k, len(texts))
    top_indices = similarities.argsort(descending=True)[:top_k]

    results = []
    for idx in top_indices:
        idx = idx.item()
        similarity = similarities[idx].item()
        result = doc_info[idx].copy()
        result['similarity'] = similarity
        results.append(result)

    print("======================================================================================== \n")
    print("Top K similar documents: \n", results)
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)
