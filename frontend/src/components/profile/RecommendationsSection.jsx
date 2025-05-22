import { Link } from 'react-router-dom';

const RecommendationsPage = () => {

  const userProfile = {
  expertise: ['Machine Learning', 'Natural Language Processing'],
  education: 'PhD in Computer Science',
  interests: ['AI Ethics', 'Reinforcement Learning']
};

  return (
    <div className="mt-10">
  <h4 className="font-bold text-lg text-gray-800 mb-4">Recommended Google Searches:</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {[
      `Latest research in ${userProfile.expertise[0]}`,
      `Top conferences for ${userProfile.expertise[1]}`,
      `${userProfile.education} opportunities`,
      `How to publish in ${userProfile.interests[0]}`,
      `Tutorial on ${userProfile.interests[1]}`
    ].map((query, idx) => (
      <a
        key={idx}
        href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gray-100 hover:bg-blue-50 border rounded-lg p-3 text-sm text-blue-700 hover:underline"
      >
        🔍 {query}
      </a>
    ))}
  </div>
</div>

  );
};

export default RecommendationsPage;