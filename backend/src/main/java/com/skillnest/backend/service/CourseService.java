package com.skillnest.backend.service;

import com.skillnest.backend.model.Course;
import com.skillnest.backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(String id) {
        return courseRepository.findById(id);
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Course updateCourse(String id, Course updatedCourse) {
        return courseRepository.findById(id).map(course -> {
            course.setTitle(updatedCourse.getTitle());
            course.setDescription(updatedCourse.getDescription());
            course.setContent(updatedCourse.getContent());
            course.setFree(updatedCourse.isFree());
            course.setPrice(updatedCourse.getPrice());
            course.setMediaUrls(updatedCourse.getMediaUrls());
            return courseRepository.save(course);
        }).orElseGet(() -> {
            updatedCourse.setId(id);
            return courseRepository.save(updatedCourse);
        });
    }

    public void deleteCourse(String id) {
        courseRepository.deleteById(id);
    }

    public Course enrollUser(String id, String userId) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        course.getEnrolledUserIds().add(userId);
        return courseRepository.save(course);
    }

    public Course unenrollUser(String id, String userId) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        course.getEnrolledUserIds().remove(userId);
        return courseRepository.save(course);
    }

    public Course updateStudyTime(String id, String userId, Double hours) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        course.getUserStudyTime().put(userId, course.getUserStudyTime().getOrDefault(userId, 0.0) + hours);
        return courseRepository.save(course);
    }

    public Set<String> getEnrolledUsers(String id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        return course.getEnrolledUserIds();
    }
}
