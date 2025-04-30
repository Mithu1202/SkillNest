import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Bookmark,
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { useChat } from '../../context/ChatContext'; // Import the chat context

const Post = ({ user, post, isFollowing, updateFollowingState }) => {
  const {
    user: postUser = {},
    createdAt,
    title,
    content,
    mediaUrls = [],
  } = post;

  const [showOptions, setShowOptions] = useState(false);
  const { openChat } = useChat(); // Use the chat context

  const isOwnPost = user?.id === postUser?._id || user?.id === postUser?.id;

  const handleFollow = async (userIdToFollow) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to follow users');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const payload = { userId: userIdToFollow };

      if (isFollowing) {
        await API.post('/auth/unfollow', payload, config);
        updateFollowingState(userIdToFollow, false);
        toast.success('Unfollowed successfully');
      } else {
        await API.post('/auth/follow', payload, config);
        updateFollowingState(userIdToFollow, true);
        toast.success('Followed successfully');
      }
    } catch (err) {
      console.error('Follow error details:', {
        error: err,
        response: err.response?.data,
      });
      toast.error(err.response?.data?.message || 'Failed to follow/unfollow');
    }
  };

  const handleMessageClick = () => {
    if (!user?.id) {
      toast.error('Please login to send messages');
      return;
    }
    openChat(postUser._id || postUser.id); // Open chat with the post user
    setShowOptions(false); // Close the options dropdown
  };

  const renderMedia = (url, idx) => {
    const fileExtension = url?.split('.').pop()?.toLowerCase();
    if (!url) return null;

    return (
      <div key={idx} className="w-full md:w-60 h-40 border rounded overflow-hidden">
        {fileExtension === 'pdf' ? (
          <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-center h-full bg-gray-100">
            <span className="text-sm text-blue-600 underline">View PDF</span>
          </a>
        ) : ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension) ? (
          <img
            src={url}
            alt="media"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
            }}
          />
        ) : ['mp4', 'webm', 'mov'].includes(fileExtension) ? (
          <video src={url} controls className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <span className="text-sm text-gray-500">Unsupported file</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <article className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <header className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <img
              src={postUser.profileImage || '/assets/avatar.png'}
              alt={`${postUser.name || 'User'} profile`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">{postUser.name || 'Unknown User'}</span>
                <p className="text-xs text-gray-500">User ID: {postUser._id || postUser.id}</p>
                {postUser.country && (
                  <img src={`/flags/${postUser.country}.png`} alt={postUser.country} className="w-4 h-3" />
                )}
                {postUser.isMember && <span className="text-gray-500 text-sm">· SN Member</span>}
              </div>
              <div className="text-gray-500 text-sm">{createdAt}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">@{postUser.username || 'username'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOwnPost && (
              <button
                onClick={() => handleFollow(postUser._id || postUser.id)}
                className={`text-sm px-4 py-0.5 rounded-full ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            <div className="relative inline-block text-left">
              <button
                className="text-gray-500 h-fit"
                aria-label="More options"
                onClick={() => setShowOptions(!showOptions)}
              >
                <MoreHorizontal size={20} />
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-sm text-gray-700"
                    onClick={() => alert('Post Saved!')}
                  >
                    <Bookmark size={16} /> Save Post
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-sm text-gray-700"
                    onClick={handleMessageClick} // Updated to open chat
                  >
                    <MessageSquare size={16} /> Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 pb-4">
        {(title || content) && (
          <div className="mt-3">
            {title && <h3 className="font-bold mb-1">{title}</h3>}
            {content && <p className="whitespace-pre-line">{content}</p>}
          </div>
        )}
        {mediaUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {mediaUrls.map(renderMedia)}
          </div>
        )}
      </section>

      <section className="flex justify-between border-t px-4 py-2">
        <div className="flex items-center gap-1">
          <Star size={16} className="text-gray-400" />
          <span className="ml-1 text-sm text-gray-600">0 Likes</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">0 Comments</span>
        </div>
      </section>

      <section className="border-t px-4 py-3 flex gap-2">
        <img
          src={user.profileImage || '/assets/avatar.png'}
          alt={`${user.name || 'User'} profile`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <input
          type="text"
          placeholder="Add a reflection"
          className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      <section className="border-t px-4 py-3">
        <button
          className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full"
          aria-label="Endorse"
        >
          <Plus size={18} />
          <span>Endorse</span>
        </button>
      </section>
    </article>
  );
};

export default Post;