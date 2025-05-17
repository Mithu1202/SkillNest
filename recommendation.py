# recommendation.py

import sqlite3

def setup_db():
    conn = sqlite3.connect('interactions.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS interactions (
            user_id TEXT,
            item_id INTEGER,
            action TEXT
        )
    ''')
    conn.commit()
    conn.close()

def track_interaction(user_id, item_id, action):
    conn = sqlite3.connect('interactions.db')
    c = conn.cursor()
    c.execute('INSERT INTO interactions (user_id, item_id, action) VALUES (?, ?, ?)', 
              (user_id, item_id, action))
    conn.commit()
    conn.close()

def get_recommendations(user_id, top_n=5):
    conn = sqlite3.connect('interactions.db')
    c = conn.cursor()
    c.execute('SELECT item_id FROM interactions WHERE user_id=?', (user_id,))
    user_items = set(row[0] for row in c.fetchall())
    
    if not user_items:
        conn.close()
        return []

    # Find similar users
    c.execute('SELECT user_id FROM interactions WHERE item_id IN ({seq}) AND user_id != ?'
              .format(seq=','.join(['?']*len(user_items))),
              tuple(user_items) + (user_id,))
    similar_users = set(row[0] for row in c.fetchall())

    # Get items from similar users
    recommendations = []
    if similar_users:
        c.execute('SELECT item_id FROM interactions WHERE user_id IN ({seq})'
                  .format(seq=','.join(['?']*len(similar_users))),
                  tuple(similar_users))
        recommended_items = [row[0] for row in c.fetchall() if row[0] not in user_items]
        recommendations = list(set(recommended_items))[:top_n]

    conn.close()
    return recommendations

def get_profile_recommendations(user_id, top_n=5):
    return get_recommendations(user_id, top_n)

def setup_posts_table():
    conn = sqlite3.connect('interactions.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY,
            title TEXT,
            content TEXT
        )
    ''')
    # Seed sample posts
    c.execute('INSERT OR IGNORE INTO posts (id, title, content) VALUES (101, "Python Basics", "Learn Python from scratch.")')
    c.execute('INSERT OR IGNORE INTO posts (id, title, content) VALUES (102, "React Guide", "A complete guide to React.")')
    c.execute('INSERT OR IGNORE INTO posts (id, title, content) VALUES (103, "Flask API", "Building APIs with Flask.")')
    c.execute('INSERT OR IGNORE INTO posts (id, title, content) VALUES (104, "Data Science", "Intro to Data Science.")')
    conn.commit()
    conn.close()
