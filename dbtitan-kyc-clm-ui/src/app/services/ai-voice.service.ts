import { Injectable, NgZone, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';

export type ScreenContext = 'dashboard' | 'documents' | 'reports';

@Injectable({
  providedIn: 'root'
})
export class AiVoiceService {
  private recognition: any;
  private synthesis = window.speechSynthesis;

  // Active Context Tracker (Defaults to 'dashboard')
  public currentContext: ScreenContext = 'dashboard';

  // Observables for UI state tracking
  public recognizedText$ = new Subject<string>();
  public aiResponse$ = new BehaviorSubject<string>('');
  public isListening = false;

  // Endpoint Switch: Automatically prefers Localhost in dev mode, falls back to Cloud Run
  private readonly LOCAL_URL = 'http://localhost:8080/api/ai/ask';
  private readonly CLOUD_RUN_URL = 'https://dbtitan-backend-406358130353.asia-south1.run.app/api/ai/ask';

  constructor(private http: HttpClient, private zone: NgZone) {
    this.initSpeechRecognition();
  }

  /**
   * Sets current active screen context before starting speech recognition
   */
  public setContext(context: ScreenContext): void {
    this.currentContext = context;
    console.log('Voice Context set to:', this.currentContext);
  }

  private initSpeechRecognition(): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;

        this.zone.run(() => {
          console.log(`Recognized Transcript [Context: ${this.currentContext}]:`, transcript);
          this.isListening = false;

          // Emit transcript to listening page components
          this.recognizedText$.next(transcript);
        });
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error, event);
        this.zone.run(() => {
          this.isListening = false;
        });
      };

      this.recognition.onend = () => {
        this.zone.run(() => {
          this.isListening = false;
        });
      };
    } else {
      console.error('SpeechRecognition API is not supported in this browser.');
    }
  }

  public startListening(context?: ScreenContext): void {
    if (context) {
      this.setContext(context);
    }

    if (this.recognition && !this.isListening) {
      console.log(`Starting speech recognition for [${this.currentContext}]...`);
      this.isListening = true;
      this.recognition.start();
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Sends prompt + query + active screen context to Spring Boot backend
   */
  public askAiBackend(question: string, context: ScreenContext = this.currentContext): void {
    // If running on localhost:4200, hit http://localhost:8080/api/ai/ask
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const backendUrl = isLocalhost ? this.LOCAL_URL : this.CLOUD_RUN_URL;

    // Sends payload matching all potential Jackson DTO bindings
    const payload = {
      prompt: question,
      query: question,
      context: context
    };

    console.log(`Sending Payload to Backend [Target: ${backendUrl}]:`, payload);

    this.http.post<any>(backendUrl, payload).subscribe({
      next: (response) => {
        console.log('AI Backend Response Received:', response);

        const replyText = response.response || response.summary || response.reply || 'Request processed successfully.';

        this.zone.run(() => {
          this.aiResponse$.next(replyText);
          this.speak(replyText);
        });
      },
      error: (err) => {
        console.error('AI Backend Request Failed:', err);

        // Page-specific fallback replies if backend is unreachable
        let fallbackText = `I have received your query for ${question}.`;

        if (context === 'dashboard') {
          fallbackText = `Dashboard analytics summary for: ${question}. Everything looks healthy.`;
        } else if (context === 'documents') {
          fallbackText = `Filtering document repository for: ${question}.`;
        } else if (context === 'reports') {
          fallbackText = `Generating client report summary for: ${question}.`;
        }

        this.zone.run(() => {
          this.aiResponse$.next(fallbackText);
          this.speak(fallbackText);
        });
      }
    });
  }

  public speak(text: string): void {
    if (!('speechSynthesis' in window)) return;

    // Stop any existing speech playback to prevent overlapping voice tracks
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    this.synthesis.speak(utterance);
  }
}
