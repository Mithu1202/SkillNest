import React from "react";
import Post from "../components/user/Post"; // adjust path if needed

const getUserId = (userObj) =>
  userObj?._id || userObj?.id || (typeof userObj === "string" ? userObj : null);

const SearchPostResults = ({ posts, user, following, onFollowToggle, refreshFollowing }) => {
  if (!posts || posts.length === 0) {
    return <p className="text-gray-600 mt-4 text-sm">No matching posts found.</p>;
  }

  return (
    <div className="space-y-6 mt-6">
      {posts.map((post) => {
        const postUserId = getUserId(post.user);
        return (
          <Post
            key={post._id || post.id}
            user={user}
            post={post}
            isFollowing={following?.has(postUserId)}
            updateFollowingState={onFollowToggle}
            refreshFollowing={refreshFollowing}
          />
        );
      })}
    </div>
  );
};

export default SearchPostResults;
