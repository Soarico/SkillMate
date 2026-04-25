import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiLoader, TuiNotification } from '@taiga-ui/core';
import { TuiProgress } from '@taiga-ui/kit';

import { LearningSession, PartnerMatch } from '../../core/models/skillmate.models';
import { PartnerSort, SkillmateStore } from '../../core/state/skillmate.store';
import { PartnerCardComponent } from '../../shared/components/partner-card/partner-card.component';
import { ProgressPercentPipe } from '../../shared/pipes/progress-percent.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    TuiButton,
    TuiLoader,
    TuiNotification,
    TuiProgress,
    PartnerCardComponent,
    ProgressPercentPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  protected readonly store = inject(SkillmateStore);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly actionMessage = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly sessionForm = this.formBuilder.nonNullable.group({
    partnerId: [0, [Validators.required, Validators.min(1)]],
    topic: ['', [Validators.required, Validators.minLength(3)]],
    startsAt: ['', [Validators.required]],
    durationMinutes: [60, [Validators.required, Validators.min(30)]],
  });

  ngOnInit(): void {
    this.store.loadWorkspace();
  }

  protected setSort(value: string): void {
    const sort = ['compatibility', 'rating', 'name'].includes(value)
      ? (value as PartnerSort)
      : 'compatibility';
    this.store.updateSort(sort);
  }

  protected propose(partner: PartnerMatch): void {
    this.actionMessage.set(null);
    this.actionError.set(null);

    this.store.proposeExchange(partner).subscribe({
      next: () => this.actionMessage.set(`Предложение обмена отправлено: ${partner.name}`),
      error: (error: Error) => this.actionError.set(error.message),
    });
  }

  protected addReview(partner: PartnerMatch): void {
    this.store.addReview(partner.id, 5, 'Отличный партнёр для обмена навыками').subscribe({
      next: () => this.actionMessage.set(`Отзыв о ${partner.name} сохранён`),
      error: (error: Error) => this.actionError.set(error.message),
    });
  }

  protected scheduleSession(): void {
    const currentProfile = this.store.currentProfile();

    if (!currentProfile || this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();

      return;
    }

    const formValue = this.sessionForm.getRawValue();
    const session: LearningSession = {
      hostId: currentProfile.id,
      partnerId: formValue.partnerId,
      topic: formValue.topic,
      startsAt: new Date(formValue.startsAt).toISOString(),
      durationMinutes: formValue.durationMinutes,
      status: 'planned',
      notes: 'Сессия создана через SkillMate',
    };

    this.store.scheduleSession(session).subscribe({
      next: () => {
        this.actionMessage.set('Сессия добавлена в расписание');
        this.sessionForm.reset({ partnerId: 0, topic: '', startsAt: '', durationMinutes: 60 });
      },
      error: (error: Error) => this.actionError.set(error.message),
    });
  }

  protected removeSession(id: number | undefined): void {
    if (!id) {
      return;
    }

    this.store.removeSession(id).subscribe({
      next: () => this.actionMessage.set('Сессия удалена'),
      error: (error: Error) => this.actionError.set(error.message),
    });
  }
}
