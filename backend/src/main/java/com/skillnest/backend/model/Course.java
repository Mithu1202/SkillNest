package com.skillnest.backend.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "courses")
public class Course {

    @Id
    private String id;

    private String title;
    private String description;
    private String content;

    private boolean isFree;
    private Double price;

    private String instructorId;
    private List<String> mediaUrls;

    private LocalDateTime createdAt;

    private Set<String> enrolledUserIds;
    private Map<String, Double> userStudyTime;

    public Course() {
        this.createdAt = LocalDateTime.now();
        this.enrolledUserIds = new HashSet<>();
        this.userStudyTime = new HashMap<>();
    }

    public Course(String title, String description, String content, boolean isFree, Double price, String instructorId, List<String> mediaUrls) {
        this.title = title;
        this.description = description;
        this.content = content;
        this.isFree = isFree;
        this.price = price;
        this.instructorId = instructorId;
        this.mediaUrls = mediaUrls;
        this.createdAt = LocalDateTime.now();
        this.enrolledUserIds = new HashSet<>();
        this.userStudyTime = new HashMap<>();
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isFree() {
        return isFree;
    }

    public void setFree(boolean free) {
        isFree = free;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(String instructorId) {
        this.instructorId = instructorId;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<String> getEnrolledUserIds() {
        return enrolledUserIds;
    }

    public void setEnrolledUserIds(Set<String> enrolledUserIds) {
        this.enrolledUserIds = enrolledUserIds;
    }

    public Map<String, Double> getUserStudyTime() {
        return userStudyTime;
    }

    public void setUserStudyTime(Map<String, Double> userStudyTime) {
        this.userStudyTime = userStudyTime;
    }
}
