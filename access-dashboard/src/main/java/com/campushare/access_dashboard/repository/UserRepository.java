package com.campushare.access_dashboard.repository;

import com.campushare.access_dashboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}