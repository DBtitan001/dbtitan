import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AiVoiceService } from '../../services/ai-voice.service';

interface TaskItem {
  id: string;
  title: string;
  clientName: string;
  assignedTo: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  currentUser = 'Admin User';
  searchQuery: string = '';
  selectedPriority: string = 'All';
  selectedStatus: string = 'All';

  // Popover / Header States
  isProfileMenuOpen = false;
  isNotificationOpen = false;
  isCreateModalOpen = false;

  tasks: TaskItem[] = [
    { id: 'TSK-101', title: 'Verify Board Resolution', clientName: 'ABC Corporation', assignedTo: 'John Analyst', dueDate: '24 Jul 2026', priority: 'High', status: 'Pending' },
    { id: 'TSK-102', title: 'Address Proof Re-validation', clientName: 'John Doe', assignedTo: 'Compliance Officer', dueDate: '25 Jul 2026', priority: 'Medium', status: 'In Progress' },
    { id: 'TSK-103', title: 'Ultimate Beneficial Owner (UBO) Screening', clientName: 'XYZ Pvt Ltd', assignedTo: 'Risk Manager', dueDate: '26 Jul 2026', priority: 'High', status: 'Pending' },
    { id: 'TSK-104', title: 'Tax Clearance Certificate Review', clientName: 'Global Solutions', assignedTo: 'John Analyst', dueDate: '28 Jul 2026', priority: 'Low', status: 'Completed' }
  ];

  taskForm = new FormGroup({
    title: new FormControl('', Validators.required),
    clientName: new FormControl('', Validators.required),
    assignedTo: new FormControl('John Analyst', Validators.required),
    dueDate: new FormControl('', Validators.required),
    priority: new FormControl('Medium', Validators.required)
  });

  constructor(
    private router: Router,
    private eRef: ElementRef,
    public voiceService: AiVoiceService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeAllMenus();
    });
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) this.currentUser = parsed.username;
      } catch (e) {}
    }
  }

  get filteredTasks(): TaskItem[] {
    return this.tasks.filter(t => {
      const matchesSearch = !this.searchQuery ||
        t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.clientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesPriority = this.selectedPriority === 'All' || t.priority === this.selectedPriority;
      const matchesStatus = this.selectedStatus === 'All' || t.status === this.selectedStatus;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
    }
  }

  closeAllMenus() {
    this.isProfileMenuOpen = false;
    this.isNotificationOpen = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationOpen = false;
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.taskForm.reset({ assignedTo: 'John Analyst', priority: 'Medium' });
  }

  onCreateSubmit() {
    if (this.taskForm.valid) {
      const newTask: TaskItem = {
        id: `TSK-10${this.tasks.length + 1}`,
        title: this.taskForm.value.title!,
        clientName: this.taskForm.value.clientName!,
        assignedTo: this.taskForm.value.assignedTo!,
        dueDate: this.taskForm.value.dueDate!,
        priority: this.taskForm.value.priority as any,
        status: 'Pending'
      };
      this.tasks.unshift(newTask);
      this.closeCreateModal();
    }
  }

  logout(event?: Event) {
    if (event) event.stopPropagation();
    this.closeAllMenus();
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
