from flask import Flask, jsonify
from recommendation import get_profile_recommendations, setup_db, setup_posts_table

app = Flask(__name__)
from recommendation import track_interaction

from recommendation import track_interaction

# Add interactions for the real user
track_interaction("681af6a2b133c0693cbfa764", 101, 'view')
track_interaction("681af6a2b133c0693cbfa764", 102, 'like')

import sqlite3

@app.route('/api/recommendations/<user_id>')
def recommendations(user_id):
    rec_ids = get_profile_recommendations(user_id)
    # Fetch post details for these IDs
    conn = sqlite3.connect('interactions.db')
    c = conn.cursor()
    if rec_ids:
        placeholders = ','.join(['?'] * len(rec_ids))
        c.execute(f"SELECT id, title, content FROM posts WHERE id IN ({placeholders})", rec_ids)
        posts = [{'id': row[0], 'title': row[1], 'content': row[2]} for row in c.fetchall()]
    else:
        posts = []
    conn.close()
    return jsonify(posts)

if __name__ == '__main__':
    setup_db()
    setup_posts_table()
    app.run(debug=True)