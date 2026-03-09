import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-try15sec',
  templateUrl: './try15sec.page.html',
  styleUrls: ['./try15sec.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonFooter,
    IonButtons,
  ],
})
export class Try15secPage implements OnDestroy {
  readonly modalCtrl = inject(ModalController);

  readonly elapsedMs = signal(0);
  readonly isRunning = signal(false);
  readonly showTimer = signal(true);
  readonly resultMessage = signal('');
  readonly isSuccess = signal<boolean | null>(null);

  private intervalId: any = null;
  private startTime = 0;

  ngOnDestroy() {
    this.clearTimer();
  }

  startGame() {
    // 既に動いていれば一旦止める
    this.clearTimer();

    this.elapsedMs.set(0);
    this.isRunning.set(true);
    this.showTimer.set(true);
    this.resultMessage.set('');
    this.isSuccess.set(null);

    this.startTime = performance.now();

    this.intervalId = setInterval(() => {
      const current = performance.now() - this.startTime;
      this.elapsedMs.set(current);

      const seconds = current / 1000;
      if (seconds <= 10 || seconds >= 15) {
        this.showTimer.set(true);
      } else {
        this.showTimer.set(false);
      }
    }, 50);
  }

  stopGame() {
    if (!this.isRunning()) {
      return;
    }

    this.clearTimer();
    const finalMs = this.elapsedMs();
    const finalSec = finalMs / 1000;
    this.showTimer.set(true);
    const targetMs = 15000;
    const toleranceMs = 100;

    if (Math.abs(finalMs - targetMs) <= toleranceMs) {
      this.isSuccess.set(true);
      this.resultMessage.set('Great! Exactly 15.00 seconds!');
    } else {
      this.isSuccess.set(false);
      this.resultMessage.set(
        `Too bad... it was ${finalSec.toFixed(2)} seconds.`,
      );
    }
  }

  readonly displaySeconds = computed(() =>
    (this.elapsedMs() / 1000).toFixed(2),
  );

  private clearTimer() {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning.set(false);
  }
}
