package com.skillnest.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.skillnest.backend.model.Course;

public interface CourseRepository extends MongoRepository<Course, String> {

}
