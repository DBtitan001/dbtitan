import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiVoiceService {
  private recognition: any;
  private synthesis = window.speechSynthesis;

  public recognizedText$ = new Subject<string>();
  public isListening = false;

  constructor(private http: HttpClient, private zone: NgZone) {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.zone.run(() => {
          this.isListening = false;
          this.recognizedText$.next(transcript);
          this.askAiBackend(transcript);
        });
      };

      this.recognition.onerror = () => {
        this.zone.run(() => (this.isListening = false));
      };

      this.recognition.onend = () => {
        this.zone.run(() => (this.isListening = false));
      };
    }
  }

  public startListening() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  private askAiBackend(question: string) {
    const backendUrl = 'http://localhost:8080/api/ai/ask';

    this.http.post<{ summary: string }>(backendUrl, { query: question }).subscribe({
      next: (response) => {
        this.speak(response.summary);
      },
      error: () => {
        this.speak("I couldn't reach the database right now. Please make sure the Spring Boot backend is running.");
      }
    });
  }

  public speak(text: string) {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    this.synthesis.speak(utterance);
  }
}
