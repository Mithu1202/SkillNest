    // ✅ PostController.java — updated to fix Post constructor error using setters
    package com.skillnest.backend.controller;

    import java.util.ArrayList;
    import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
    import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.CrossOrigin;
    import org.springframework.web.bind.annotation.DeleteMapping;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PathVariable;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.PutMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RequestParam;
    import org.springframework.web.bind.annotation.RestController;
    import org.springframework.web.multipart.MultipartFile;
    import org.springframework.web.bind.annotation.PutMapping;
    import org.springframework.http.HttpStatus;

    import com.skillnest.backend.dto.DocumentDTO;
    import com.skillnest.backend.dto.PostDTO;
    import com.skillnest.backend.model.Post;
    import com.skillnest.backend.model.User;
    import com.skillnest.backend.repository.PostRepository;
    import com.skillnest.backend.repository.UserRepository;
    import com.skillnest.backend.service.GetRecommendations;
    import com.skillnest.backend.service.PostService;

    @RestController
    @RequestMapping("/api/auth/posts")
    @CrossOrigin(origins = "http://localhost:5173")
    public class PostController {

        @Autowired private PostService postService;
        @Autowired private PostRepository postRepository;
        @Autowired private UserRepository userRepository;

        @PostMapping(consumes = {"multipart/form-data"})
        public ResponseEntity<?> createPostWithMedia(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("visibility") String visibility,
            @RequestParam("addToPortfolio") boolean addToPortfolio,
            @RequestParam("userId") String userId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
        ) {
            try {
                Post post = new Post();
                post.setUserId(userId);
                post.setTitle(title);
                post.setContent(content);
                post.setVisibility(visibility);
                post.setAddToPortfolio(addToPortfolio);

                Post savedPost = postService.createPost(post, files);
                return ResponseEntity.status(201).body(savedPost);
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Error creating post: " + e.getMessage());
            }
        }

    @GetMapping
public ResponseEntity<List<Map<String, Object>>> getAllPosts(@RequestParam String UserId) {
    List<Post> posts = postRepository.findAll();

    // Retrieve the user's profession for recommendations
    String recommendationText = userRepository.findById(UserId)
            .map(User::getProfession)
            .orElse("") + " " + userRepository.findById(UserId)
            .map(User::getFieldOfStudy)
            .orElse("");

    // Retrieve the list of user IDs that the current user is following
    Set<String> followingSet = userRepository.findById(UserId)
            .map(user -> new HashSet<>(user.getFollowing()))
            .orElse(new HashSet<>());

    // Prepare the DocumentDTO with all posts
    List<PostDTO> postDTOList = posts.stream().map(post -> {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setValue(post.getContent());
        return dto;
    }).collect(Collectors.toList());

    DocumentDTO documentDTO = new DocumentDTO();
    documentDTO.setDocuments(postDTOList.toArray(new PostDTO[0]));
    documentDTO.setNew_text(recommendationText);

    // Call the recommendation service with all posts
    GetRecommendations getRecommendationsService = new GetRecommendations();
    List<Map<String, Object>> recommendations = getRecommendationsService.getRecommendationsService(documentDTO);

    // Map post IDs to their similarity scores
    Map<String, Double> similarityMap = recommendations.stream()
            .collect(Collectors.toMap(
                    r -> (String) r.get("id"),
                    r -> ((Number) r.get("similarity")).doubleValue()
            ));

    // Sort posts by similarity in descending order
    List<Post> sortedPosts = posts.stream()
            .sorted((p1, p2) -> {
                double sim1 = similarityMap.getOrDefault(p1.getId(), 0.0);
                double sim2 = similarityMap.getOrDefault(p2.getId(), 0.0);
                return Double.compare(sim2, sim1); // Descending
            })
            .collect(Collectors.toList());

    // Separate posts into those from followed users and others
    List<Post> followedPosts = new ArrayList<>();
    List<Post> otherPosts = new ArrayList<>();

    for (Post post : sortedPosts) {
        if (followingSet.contains(post.getUserId())) {
            followedPosts.add(post);
        } else {
            otherPosts.add(post);
        }
    }

    // Combine followed posts and other posts
    List<Post> finalSortedPosts = new ArrayList<>();
    finalSortedPosts.addAll(followedPosts);
    finalSortedPosts.addAll(otherPosts);

    // Build enriched response for each post
    List<Map<String, Object>> enrichedPosts = finalSortedPosts.stream().map(post -> {
        Map<String, Object> map = new HashMap<>();
        map.put("id", post.getId());
        map.put("title", post.getTitle());
        map.put("content", post.getContent());
        map.put("mediaUrls", post.getMediaUrls());
        map.put("createdAt", post.getCreatedAt());
        map.put("userId", post.getUserId());
        map.put("likeCount", post.getLikedBy().size());
        map.put("commentCount", post.getCommentIds().size());
        map.put("likedBy", post.getLikedBy());
        userRepository.findById(post.getUserId()).ifPresent(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getName());
            userMap.put("profileImage", user.getProfileImage());
            userMap.put("country", user.getCountry());
            userMap.put("username", user.getEmail().split("@")[0]);
            userMap.put("isMember", true);
            map.put("user", userMap);
        });
        return map;
    }).collect(Collectors.toList());

    return ResponseEntity.ok(enrichedPosts);
}



        @PostMapping("/text")
        public ResponseEntity<Post> createPostTextOnly(@RequestBody Post post) {
            return ResponseEntity.ok(postService.savePost(post));
        }

        @GetMapping("/user")
        public ResponseEntity<List<Post>> getUserPosts(@RequestParam String userId) {
            return ResponseEntity.ok(postService.getUserPosts(userId));
        }

        @GetMapping("/visible")
        public ResponseEntity<List<Post>> getVisiblePosts(@RequestParam String visibility, @RequestParam String userId) {
            return ResponseEntity.ok(postService.getVisiblePosts(visibility, userId));
        }

        @DeleteMapping("/{postId}")
        public ResponseEntity<?> deletePost(@PathVariable String postId) {
            try {
                postService.deletePost(postId);
                return ResponseEntity.ok("Post deleted successfully");
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Error deleting post");
            }
        }
        @PutMapping("/{postId}")
        public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("visibility") String visibility,
            @RequestParam("addToPortfolio") boolean addToPortfolio,
            @RequestParam("userId") String userId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
        ) {
            try {
                Post updatedPost = new Post();
                updatedPost.setId(postId);
                updatedPost.setUserId(userId);
                updatedPost.setTitle(title);
                updatedPost.setContent(content);
                updatedPost.setVisibility(visibility);
                updatedPost.setAddToPortfolio(addToPortfolio);

                Post savedPost = postService.updatePost(postId, updatedPost, files);
                return ResponseEntity.ok(savedPost);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating post: " + e.getMessage());
            }
        }
    }