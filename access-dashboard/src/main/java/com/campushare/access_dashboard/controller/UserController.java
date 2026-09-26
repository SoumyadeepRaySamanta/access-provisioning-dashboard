package com.campushare.access_dashboard.controller;

import com.campushare.access_dashboard.model.User;
import com.campushare.access_dashboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200",
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                        RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 1. Create a User
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    // 2. Read all Users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 3. Update a User
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setEmail(userDetails.getEmail());
        user.setDepartment(userDetails.getDepartment());
        user.setAccessRole(userDetails.getAccessRole());
        user.setActive(userDetails.isActive());

        return ResponseEntity.ok(userRepository.save(user));
    }

    // 4. Delete a User
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User with ID " + id + " has been completely deleted.");
    }
}