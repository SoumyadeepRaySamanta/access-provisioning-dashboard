package com.campushare.access_dashboard.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String accessRole;

    // FIX: Explicitly tell Jackson to use "isActive" as the JSON key.
    // Lombok generates isActive() getter, which Jackson strips the "is" prefix from,
    // serializing as "active" instead of "isActive" — causing silent 400 errors on POST/PUT.
    @JsonProperty("isActive")
    @Column(nullable = false)
    private boolean isActive;
}