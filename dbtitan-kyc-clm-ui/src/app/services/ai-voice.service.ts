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
          console.log('Recognized:', transcript);
          this.isListening = false;
          this.recognizedText$.next(transcript);
          this.askAiBackend(transcript);
        });
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error, event);

        this.zone.run(() => {
          this.isListening = false;
        });
      };

      this.recognition.onend = () => {
        console.log('Speech Recognition ended');

        this.zone.run(() => {
          this.isListening = false;
        });
      };
    } else {
      console.error('SpeechRecognition is not supported in this browser.');
    }
  }

  public startListening() {
    if (this.recognition && !this.isListening) {
      console.log('Starting speech recognition...');
      this.isListening = true;
      this.recognition.start();
    }
  }

  private askAiBackend(question: string) {
    const backendUrl =
      'https://dbtitan-backend-406358130353.asia-south1.run.app/api/ai/ask';

    this.http.post<{ summary: string }>(backendUrl, { query: question }).subscribe({
      next: (response) => {
        console.log('AI Response:', response);
        this.speak(response.summary);
      },
      error: (err) => {
        console.error('AI Backend Error:', err);
        this.speak("I couldn't reach the database right now.");
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
