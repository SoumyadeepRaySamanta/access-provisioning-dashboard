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

  // ── State ──────────────────────────────────────────────────────────────────
  users: User[] = [];
  filteredUsers: User[] = [];

  // Form state
  newUser: User = { email: '', department: '', accessRole: 'Viewer', isActive: true };
  editingUser: User | null = null;
  editSnapshot: User | null = null;

  // New views state
  auditLogs = [
    { time: '10 mins ago', action: 'ADD_USER', user: 'admin@company.com', details: 'Added new Admin user hr.lead@company.com' },
    { time: '1 hour ago', action: 'UPDATE', user: 'system_sync', details: 'System updated user roles automatically.' },
    { time: '3 hours ago', action: 'DELETE_USER', user: 'admin@company.com', details: 'Deleted user contractor_09@company.com' },
    { time: '1 day ago', action: 'ADD_USER', user: 'manager_eng@company.com', details: 'Added new Viewer intern.12@company.com' },
    { time: '2 days ago', action: 'LOGIN_ATTEMPT', user: 'system', details: 'Failed login attempt for unknown@company.com' }
  ];

  accessRolesList = [
    { name: 'Viewer', desc: 'Read-only access to basic dashboards', users: 145, perms: ['Read'] },
    { name: 'Editor', desc: 'Can modify content but cannot manage users', users: 56, perms: ['Read', 'Write'] },
    { name: 'Manager', desc: 'Can manage users within their department', users: 12, perms: ['Read', 'Write', 'Approve'] },
    { name: 'Admin', desc: 'Full administrative access across all modules', users: 4, perms: ['Read', 'Write', 'Approve', 'Delete'] }
  ];

  settingsState = {
    mfa: true,
    emailAlerts: true,
    autoRevoke: false,
    sessionTimeout: '30'
  };

  // UI state
  showProvisionModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  deleteTargetId: number | null = null;
  isLoading = false;
  activeTab = 'Dashboard';
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  toastVisible = false;

  // Filter/search state
  searchQuery = '';
  filterRole = '';
  filterStatus = '';
  filterDept = '';

  // Analytics
  get totalUsers(): number { return this.users.length; }
  get activeUsers(): number { return this.users.filter(u => u.isActive).length; }
  get inactiveUsers(): number { return this.users.filter(u => !u.isActive).length; }
  get activePercent(): number {
    return this.totalUsers === 0 ? 0 : Math.round((this.activeUsers / this.totalUsers) * 100);
  }

  get departmentBreakdown(): { name: string; count: number; percent: number }[] {
    const map = new Map<string, number>();
    this.users.forEach(u => {
      const dept = u.department || 'Unassigned';
      map.set(dept, (map.get(dept) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percent: this.totalUsers === 0 ? 0 : Math.round((count / this.totalUsers) * 100)
      }));
  }

  get roleBreakdown(): { role: string; count: number }[] {
    const map = new Map<string, number>();
    this.users.forEach(u => {
      const role = u.accessRole || 'Unassigned';
      map.set(role, (map.get(role) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => ({ role, count }));
  }

  get uniqueDepartments(): string[] {
    return [...new Set(this.users.map(u => u.department).filter(d => d && d.trim() !== ''))].sort();
  }

  // ── Role & Department Options ───────────────────────────────────────────────
  readonly roleOptions = ['Admin', 'Developer', 'Analyst', 'Viewer'];
  readonly departmentOptions = [
    'Engineering', 'Product', 'Design', 'Marketing',
    'Sales', 'Finance', 'HR', 'Operations', 'Security', 'Legal'
  ];

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ── Data Operations ─────────────────────────────────────────────────────────

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching users', err);
        this.isLoading = false;
        this.showToast('Failed to load users. Is the backend running?', 'error');
      }
    });
  }

  provisionUser(): void {
    if (!this.newUser.email?.trim() || !this.newUser.department?.trim()) {
      this.showToast('Email and Department are required.', 'error');
      return;
    }
    // Capture email BEFORE resetting the form so the toast can reference it
    const provisionedEmail = this.newUser.email;
    this.isLoading = true;
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.isLoading = false;
        this.showProvisionModal = false;
        this.resetNewUserForm();
        this.showToast(`Added user ${provisionedEmail} successfully.`, 'success');
        this.loadUsers();
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.status === 409 ? 'Email already exists in the system.' : 'Failed to add user.';
        this.showToast(msg, 'error');
      }
    });
  }

  openEditModal(user: User): void {
    this.editSnapshot = { ...user };
    this.editingUser = { ...user };
    this.showEditModal = true;
  }

  saveEdit(): void {
    if (!this.editingUser || !this.editingUser.id) return;
    this.isLoading = true;

    // Construct a clean payload to prevent extra Jackson-generated keys (like "active") 
    // from being sent back and overriding "isActive" during deserialization.
    const payload: User = {
      id: this.editingUser.id,
      email: this.editingUser.email,
      department: this.editingUser.department,
      accessRole: this.editingUser.accessRole,
      isActive: this.editingUser.isActive
    };

    this.userService.updateUser(this.editingUser.id, payload).subscribe({
      next: () => {
        this.loadUsers();
        this.closeEditModal();
        this.showToast('User record updated successfully.', 'success');
      },
      error: (err: any) => {
        this.isLoading = false;
        this.showToast('Failed to update user.', 'error');
      }
    });
  }

  closeEditModal(): void {
    this.editingUser = null;
    this.editSnapshot = null;
    this.showEditModal = false;
  }

  toggleUserStatus(user: User): void {
    const payload: User = {
      id: user.id,
      email: user.email,
      department: user.department,
      accessRole: user.accessRole,
      isActive: !user.isActive
    };
    this.userService.updateUser(user.id!, payload).subscribe({
      next: () => {
        this.loadUsers();
        const status = payload.isActive ? 'activated' : 'deactivated';
        this.showToast(`Account ${status} for ${user.email}.`, 'info');
      },
      error: () => this.showToast('Failed to update status.', 'error')
    });
  }

  confirmDelete(id: number): void {
    this.deleteTargetId = id;
    this.showDeleteConfirm = true;
  }

  executeDelete(): void {
    if (this.deleteTargetId == null) return;
    this.userService.deleteUser(this.deleteTargetId).subscribe({
      next: () => {
        this.loadUsers();
        this.showDeleteConfirm = false;
        this.deleteTargetId = null;
        this.showToast('User deleted successfully.', 'success');
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Failed to delete user.', 'error')
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
  }

  // ── Filtering ───────────────────────────────────────────────────────────────

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredUsers = this.users.filter(u => {
      const matchesSearch = !q ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.accessRole.toLowerCase().includes(q);
      const matchesRole = !this.filterRole || u.accessRole === this.filterRole;
      const matchesStatus = !this.filterStatus ||
        (this.filterStatus === 'active' ? u.isActive : !u.isActive);
      const matchesDept = !this.filterDept || u.department === this.filterDept;
      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterRole = '';
    this.filterStatus = '';
    this.filterDept = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.filterRole || this.filterStatus || this.filterDept);
  }

  // ── Utility ─────────────────────────────────────────────────────────────────

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      'Admin': 'badge-red',
      'Developer': 'badge-blue',
      'Analyst': 'badge-purple',
      'Viewer': 'badge-gray'
    };
    return map[role] || 'badge-gray';
  }

  getUserInitials(email: string): string {
    if (!email) return '??';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : email.substring(0, 2).toUpperCase();
  }

  getAvatarGradient(email: string): string {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      'linear-gradient(135deg, #ffecd2, #fcb69f)',
    ];
    const idx = email.charCodeAt(0) % gradients.length;
    return gradients[idx];
  }

  resetNewUserForm(): void {
    this.newUser = { email: '', department: '', accessRole: 'Viewer', isActive: true };
  }

  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 3500);
  }

  trackByUserId(index: number, user: User): number {
    return user.id ?? index;
  }

  // ── UI Navigation ─────────────────────────────────────────────────────────

  switchTab(tab: string, event: Event): void {
    event.preventDefault();
    this.activeTab = tab;
  }
}
