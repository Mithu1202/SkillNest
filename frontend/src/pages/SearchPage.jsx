import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import Navigation from '../components/user/Navigation';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import SearchPostResults from './SearchPostResults';
import { toast } from 'react-toastify';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(new Set());

  const navigate = useNavigate();

  const getUserId = (userObj) =>
    userObj?._id || userObj?.id || (typeof userObj === "string" ? userObj : null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    if (!savedUser || !token) return;

    setUser(savedUser);

    const fetchFollowing = async () => {
      try {
        const { data } = await API.get(`/auth/following/${savedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFollowing(new Set((data || []).filter(Boolean).map(getUserId)));
      } catch (err) {
        console.error("Error fetching following list:", err);
      }
    };

    fetchFollowing();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setError('');
      setSearchResults([]);
      const response = await API.get(`/auth/posts/search?query=${encodeURIComponent(searchQuery)}`);
      const results = response.data;

      setSearchResults(results);

      if (results.length === 1) {
        // navigate(`/posts/${results[0].id || results[0]._id}`);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Something went wrong while searching. Please try again.');
    }
  };

  const handleFollowToggle = useCallback((userId, follow) => {
    setFollowing((prev) => {
      const updated = new Set(prev);
      follow ? updated.add(userId) : updated.delete(userId);
      return updated;
    });
  }, []);

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = user?.id;
      if (!token || !userId) return;

      const { data } = await API.get(`/auth/following/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFollowing(new Set((data || []).filter(Boolean).map(getUserId)));
    } catch (err) {
      console.error("Error fetching following list:", err);
      toast.error("Failed to load following list");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Search Posts</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Search input */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by title or content..."
              className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 p-2 rounded-md hover:bg-blue-700"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Render search results */}
          <SearchPostResults
            posts={searchResults}
            user={user}
            following={following}
            onFollowToggle={handleFollowToggle}
            refreshFollowing={fetchFollowing}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
