import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { UserService } from './user.service';
import { User } from './user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  users: User[] = [];
  newUser: User = { email: '', department: '', accessRole: '', isActive: true };

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching users', err)
    });
  }

    addUser(): void {
    // Stop the function if the email or department is blank
    if (!this.newUser.email || !this.newUser.department) {
      alert('Please fill out the required fields.');
      return;
    }

    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.loadUsers(); 
        this.newUser = { email: '', department: '', accessRole: '', isActive: true }; 
      },
      error: (err: any) => console.error('Error adding user', err)
    });
  }


    deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
        this.cdr.detectChanges(); // Forces the UI to redraw immediately
      },
      error: (err: any) => console.error('Error deleting user', err)
    });
  }

}
