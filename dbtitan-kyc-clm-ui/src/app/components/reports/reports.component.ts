import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';

import { AiVoiceService } from '../../services/ai-voice.service';
import { ReportService, ReportEntity } from '../../services/report.service';
import { ClientService, Client } from '../../services/client.service';
import { DocumentService } from '../../services/document.service';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('categoryChartCanvas') categoryChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChartCanvas') statusChartCanvas!: ElementRef<HTMLCanvasElement>;

  currentUser = 'Admin User';
  searchQuery: string = '';
  selectedCategory: string = 'All';

  // Live Database Reports Array
  reports: ReportEntity[] = [];
  availableClients: Client[] = [];
  selectedClient: Client | null = null;
  clientDocuments: any[] = [];

  // Wizard Controls
  isWizardOpen = false;
  wizardStep = 1;
  isGenerating = false;

  private categoryChart?: Chart;
  private statusChart?: Chart;
  private voiceSubscription?: Subscription;

  constructor(
    private router: Router,
    public voiceService: AiVoiceService,
    private reportService: ReportService,
    private clientService: ClientService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) this.currentUser = parsed.username;
      } catch (e) {}
    }

    this.loadReportsFromBackend();
    this.loadClients();
    this.listenToVoiceCommands();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderCharts(), 300);
  }

  ngOnDestroy(): void {
    if (this.voiceSubscription) {
      this.voiceSubscription.unsubscribe();
    }
    this.categoryChart?.destroy();
    this.statusChart?.destroy();
  }

  /**
   * Listens to speech-to-text transcript with 'reports' context awareness,
   * sanitizing conversational phrases and providing real-time data analysis.
   */
  private listenToVoiceCommands(): void {
    // Set active context to 'reports'
    this.voiceService.setContext('reports');

    this.voiceSubscription = this.voiceService.recognizedText$.subscribe((spokenText: string) => {
      if (!spokenText) return;

      console.log('Voice Command Received in Reports:', spokenText);
      const lowerText = spokenText.toLowerCase();

      // Trigger AI backend request with screen context
      this.voiceService.askAiBackend(spokenText, 'reports');

      // 1. Clean up conversational filler words to protect searchQuery integrity
      const cleanedInput = lowerText
        .replace(/\b(please|can you|i want|could you|tell me|give me|show me|display|find|search for|reports|for)\b/g, '')
        .trim();

      // 2. Check if query matches a specific Client
      const matchedClient = this.availableClients.find(client =>
        (client.clientName && lowerText.includes(client.clientName.toLowerCase())) ||
        (client.clientId && lowerText.includes(client.clientId.toLowerCase()))
      );

      if (matchedClient) {
        this.selectedClient = matchedClient;
        if (matchedClient.clientId) {
          this.fetchClientDocuments(matchedClient.clientId);
        }

        const clientSpeech = `Selected client ${matchedClient.clientName}. Risk rating is ${matchedClient.riskRating}. Opening report wizard.`;
        this.voiceService.aiResponse$.next(clientSpeech);
        this.voiceService.speak(clientSpeech);

        this.openWizard();
        return;
      }

      // 3. Open empty Report Wizard
      if (lowerText.includes('wizard') || lowerText.includes('launch') || lowerText.includes('create report')) {
        const wizardSpeech = 'Opening Client Report Wizard.';
        this.voiceService.aiResponse$.next(wizardSpeech);
        this.voiceService.speak(wizardSpeech);
        this.openWizard();
        return;
      }

      // 4. Category Filtering via Voice
      if (lowerText.includes('compliance')) {
        this.selectedCategory = 'Compliance';
        this.searchQuery = '';
        const count = this.reports.filter(r => r.category === 'Compliance').length;
        const speech = `Filtering for Compliance reports. You have ${count} records.`;
        this.voiceService.aiResponse$.next(speech);
        this.voiceService.speak(speech);
        return;
      }

      if (lowerText.includes('risk')) {
        this.selectedCategory = 'Risk Assessment';
        this.searchQuery = '';
        const highRiskCount = this.availableClients.filter(c => c.riskRating === 'High').length;
        const speech = `Showing Risk Assessment reports. There are currently ${highRiskCount} high-risk clients in database.`;
        this.voiceService.aiResponse$.next(speech);
        this.voiceService.speak(speech);
        return;
      }

      if (lowerText.includes('onboarding')) {
        this.selectedCategory = 'Client Onboarding';
        this.searchQuery = '';
        const speech = 'Filtering for Client Onboarding reports.';
        this.voiceService.aiResponse$.next(speech);
        this.voiceService.speak(speech);
        return;
      }

      if (lowerText.includes('audit')) {
        this.selectedCategory = 'Audit';
        this.searchQuery = '';
        const speech = 'Showing Audit Trail and exception log reports.';
        this.voiceService.aiResponse$.next(speech);
        this.voiceService.speak(speech);
        return;
      }

      // 5. Database Summary & Totals
      if (lowerText.includes('summary') || lowerText.includes('analytics') || lowerText.includes('total') || lowerText.includes('how many')) {
        const speech = `There are ${this.reports.length} total generated reports available across ${this.availableClients.length} registered clients.`;
        this.voiceService.aiResponse$.next(speech);
        this.voiceService.speak(speech);
        this.searchQuery = '';
        return;
      }

      // 6. Search Filter Application (only if a valid keyword remains)
      if (cleanedInput.length > 1) {
        this.searchQuery = cleanedInput;
        const speech = `Searching reports for ${cleanedInput}.`;
        this.voiceService.aiResponse$.next(speech);
        this.voiceService.speak(speech);
      } else {
        // Reset query if only filler words were spoken
        this.searchQuery = '';
        const speech = `Displaying all ${this.reports.length} reports. Say a client name or category to filter.`;
        this.voiceService.aiResponse$.next(speech);
        this.voiceService.speak(speech);
      }
    });
  }

  loadReportsFromBackend(): void {
    this.reportService.getAllReports().subscribe({
      next: (data: ReportEntity[]) => {
        this.reports = data;
        this.renderCharts();
      },
      error: (err) => console.error('Failed to load reports from database:', err)
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients: Client[]) => {
        this.availableClients = clients;
        if (clients.length > 0 && !this.selectedClient) {
          this.selectedClient = clients[0];
        }
        this.renderCharts();
      },
      error: (err) => console.error('Error fetching clients:', err)
    });
  }

  renderCharts(): void {
    if (!this.categoryChartCanvas || !this.statusChartCanvas) return;

    this.categoryChart?.destroy();
    this.statusChart?.destroy();

    this.categoryChart = new Chart(this.categoryChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Compliance', 'Risk Assessment', 'Client Onboarding', 'Audit'],
        datasets: [{
          data: [
            this.reports.filter(r => r.category === 'Compliance').length || 3,
            this.reports.filter(r => r.category === 'Risk Assessment').length || 1,
            this.reports.filter(r => r.category === 'Client Onboarding').length || 1,
            this.reports.filter(r => r.category === 'Audit').length || 1
          ],
          backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6'],
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'right',
            labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 12, weight: 'bold' } }
          }
        }
      }
    });

    this.statusChart = new Chart(this.statusChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
        datasets: [{
          label: 'Clients Breakdown',
          data: [
            this.availableClients.filter(c => c.riskRating === 'High').length || 3,
            this.availableClients.filter(c => c.riskRating === 'Medium').length || 2,
            this.availableClients.filter(c => c.riskRating === 'Low').length || 4
          ],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
          borderRadius: 8,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  openWizard(): void {
    this.isWizardOpen = true;
    this.wizardStep = 1;
    if (this.selectedClient?.clientId) {
      this.fetchClientDocuments(this.selectedClient.clientId);
    }
  }

  closeWizard(): void {
    this.isWizardOpen = false;
  }

  onClientSelectChange(clientId: string): void {
    const found = this.availableClients.find(c => c.clientId === clientId);
    if (found) {
      this.selectedClient = found;
      if (found.clientId) {
        this.fetchClientDocuments(found.clientId);
      }
    }
  }

  fetchClientDocuments(clientId: string): void {
    this.documentService.getAllDocuments().subscribe({
      next: (docs: any[]) => {
        this.clientDocuments = docs.filter(d => {
          const docClientId = d.client?.clientId || d.clientId;
          return docClientId === clientId;
        });
      },
      error: (err) => console.error('Error fetching client documents:', err)
    });
  }

  generateNewReport(): void {
    this.openWizard();
  }

  generateWizardReport(): void {
    if (!this.selectedClient || !this.selectedClient.clientId) return;

    this.isGenerating = true;

    this.reportService.createWizardReport(this.selectedClient.clientId, this.currentUser).subscribe({
      next: (savedReport: ReportEntity) => {
        this.reports.unshift(savedReport);
        this.downloadReport(savedReport);
        this.renderCharts();
        this.isGenerating = false;
        this.closeWizard();
      },
      error: (err) => {
        this.isGenerating = false;
        alert('Failed to save wizard report to database.');
        console.error(err);
      }
    });
  }

  get filteredReports(): ReportEntity[] {
    return this.reports.filter(rpt => {
      const matchesSearch = !this.searchQuery ||
        (rpt.title && rpt.title.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (rpt.reportId && rpt.reportId.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCategory = this.selectedCategory === 'All' || rpt.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  downloadReport(report: ReportEntity): void {
    if (!report.reportId) return;

    this.reportService.downloadReportFile(report.reportId).subscribe({
      next: (blob: Blob) => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = `${report.reportId}_${(report.title || 'Report').replace(/\s+/g, '_')}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      },
      error: (err) => alert('Error downloading PDF from server.')
    });
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
