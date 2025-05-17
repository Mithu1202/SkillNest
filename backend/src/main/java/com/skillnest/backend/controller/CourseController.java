package com.skillnest.backend.controller;

import com.skillnest.backend.model.Course;
import com.skillnest.backend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/{id}")
    public Optional<Course> getCourseById(@PathVariable String id) {
        return courseService.getCourseById(id);
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable String id, @RequestBody Course updatedCourse) {
        return courseService.updateCourse(id, updatedCourse);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
    }

    @PostMapping("/{id}/enroll")
    public Course enrollUser(@PathVariable String id, @RequestParam String userId) {
        return courseService.enrollUser(id, userId);
    }

    @PostMapping("/{id}/unenroll")
    public Course unenrollUser(@PathVariable String id, @RequestParam String userId) {
        return courseService.unenrollUser(id, userId);
    }

    @PostMapping("/{id}/study-time")
    public Course updateStudyTime(@PathVariable String id, @RequestParam String userId, @RequestParam Double hours) {
        return courseService.updateStudyTime(id, userId, hours);
    }

    @GetMapping("/{id}/enrolled")
    public Set<String> getEnrolledUsers(@PathVariable String id) {
        return courseService.getEnrolledUsers(id);
    }
}
