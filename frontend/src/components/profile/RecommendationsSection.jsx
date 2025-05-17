import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const RecommendationsPage = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedOnce = useRef(false);

  useEffect(() => {
    if (!fetchedOnce.current && userId) {
      fetchedOnce.current = true;
      fetch(`/api/recommendations/${userId}`)
        .then(res => res.json())
        .then(data => {
          setRecommendations(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => {
          setRecommendations([]);
          setLoading(false);
        });
    }
  }, [userId]);

  const handleLike = (postId) => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postId, action: 'like' }),
    });
  };

  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <h3 className="text-xl font-semibold text-blue-700 mb-4">Recommendations</h3>
      <p className="text-sm text-gray-600 mb-6">
        This section displays recommendations or compliments you have received.
      </p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 text-sm">
        📧 Request a Recommendation
      </button>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : recommendations.length === 0 ? (
          <p>No Recommendations Received</p>
        ) : (
          <ul className="space-y-4">
            {recommendations.map((rec) => (
              <li key={rec.id} className="border p-4 rounded-md shadow-sm">
                <strong className="text-lg">{rec.title}</strong>
                <div className="text-sm text-gray-700 mt-2">{rec.content}</div>
                <button
                  onClick={() => handleLike(rec.id)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  👍 Like
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <Link to="/profile" className="text-blue-600 hover:underline">
          ← Back to Profile
        </Link>
      </div>
    </div>
  );
};

export default RecommendationsPage;
