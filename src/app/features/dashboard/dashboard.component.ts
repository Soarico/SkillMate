import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiLoader, TuiNotification } from '@taiga-ui/core';
import { TuiTextfield } from '@taiga-ui/core/components/textfield';
import { TuiProgress } from '@taiga-ui/kit';

import { LearningSession, PartnerMatch, SkillGroup } from '../../core/models/skillmate.models';
import { PartnerSort, SkillmateStore } from '../../core/state/skillmate.store';
import { PartnerCardComponent } from '../../shared/components/partner-card/partner-card.component';
import { ProgressPercentPipe } from '../../shared/pipes/progress-percent.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiLoader,
    TuiNotification,
    TuiProgress,
    TuiTextfield,
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
  protected readonly selectedPartner = signal<PartnerMatch | null>(null);
  protected readonly selectedReviewPartner = signal<PartnerMatch | null>(null);
  protected readonly selectedInvitePartner = signal<PartnerMatch | null>(null);
  protected readonly ratingOptions = [
    '5 — отлично',
    '4 — хорошо',
    '3 — нормально',
    '2 — есть сложности',
    '1 — не рекомендую',
  ] as const;
  protected readonly exchangeForm = this.formBuilder.nonNullable.group({
    topic: ['', [Validators.required, Validators.minLength(3)]],
    startsAt: ['', [Validators.required]],
    durationMinutes: [60, [Validators.required, Validators.min(30)]],
  });
  protected readonly reviewForm = this.formBuilder.nonNullable.group({
    rating: ['5 — отлично', [Validators.required]],
    text: ['', [Validators.required, Validators.minLength(10)]],
  });
  protected readonly inviteForm = this.formBuilder.nonNullable.group({
    groupTitle: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.store.loadWorkspace();
  }

  protected setCategory(value: string | null): void {
    this.store.updateCategory(value ?? 'all');
  }

  protected setSort(value: string | null): void {
    const sort = ['compatibility', 'rating', 'name'].includes(value ?? '')
      ? (value as PartnerSort)
      : 'compatibility';

    this.store.updateSort(sort);
  }

  protected openExchange(partner: PartnerMatch): void {
    this.actionMessage.set(null);
    this.actionError.set(null);
    this.selectedPartner.set(partner);
    this.selectedReviewPartner.set(null);
    this.selectedInvitePartner.set(null);
    this.exchangeForm.reset({
      topic: `Обмен: ${partner.teachSkills.at(0)?.name ?? 'новый навык'}`,
      startsAt: this.defaultSessionDateTime(),
      durationMinutes: 60,
    });
  }

  protected closeExchange(): void {
    this.selectedPartner.set(null);
    this.exchangeForm.reset({ topic: '', startsAt: '', durationMinutes: 60 });
  }

  protected openReview(partner: PartnerMatch): void {
    this.actionMessage.set(null);
    this.actionError.set(null);
    this.selectedPartner.set(null);
    this.selectedInvitePartner.set(null);
    this.selectedReviewPartner.set(partner);
    this.reviewForm.reset({
      rating: '5 — отлично',
      text: '',
    });
  }

  protected closeReview(): void {
    this.selectedReviewPartner.set(null);
    this.reviewForm.reset({ rating: '5 — отлично', text: '' });
  }

  protected openInvite(partner: PartnerMatch): void {
    this.actionMessage.set(null);
    this.actionError.set(null);
    this.selectedPartner.set(null);
    this.selectedReviewPartner.set(null);
    this.selectedInvitePartner.set(partner);
    this.inviteForm.reset({ groupTitle: '' });
  }

  protected closeInvite(): void {
    this.selectedInvitePartner.set(null);
    this.inviteForm.reset({ groupTitle: '' });
  }

  protected availableGroupsForPartner(partner: PartnerMatch): SkillGroup[] {
    return this.store
      .groups()
      .filter(
        (group) => !group.memberIds.some((memberId) => String(memberId) === String(partner.id)),
      );
  }

  protected availableGroupTitlesForPartner(partner: PartnerMatch): string[] {
    return this.availableGroupsForPartner(partner).map((group) => group.title);
  }

  protected submitInvite(): void {
    const partner = this.selectedInvitePartner();

    if (!partner || this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();

      return;
    }

    const groupTitle = this.inviteForm.getRawValue().groupTitle;
    const group = this.store.groups().find((item) => item.title === groupTitle);

    if (!group) {
      this.actionError.set('Группа не найдена');

      return;
    }

    this.store.addGroupMember(group, partner.id).subscribe({
      next: () => {
        this.actionMessage.set(`Пользователь ${partner.name} приглашён в группу «${group.title}»`);
        this.closeInvite();
      },
      error: (error: Error) => this.actionError.set(error.message),
    });
  }

  protected submitReview(): void {
    const partner = this.selectedReviewPartner();

    if (!partner || this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();

      return;
    }

    const formValue = this.reviewForm.getRawValue();
    const rating = this.parseRating(formValue.rating);

    this.store.addReview(partner.id, rating, formValue.text).subscribe({
      next: () => {
        this.actionMessage.set(`Отзыв сохранён. Оценка: ${rating}/5`);
        this.closeReview();
      },
      error: (error: Error) => this.actionError.set(error.message),
    });
  }

  protected submitExchange(): void {
    const currentProfile = this.store.currentProfile();
    const partner = this.selectedPartner();

    if (!currentProfile || !partner || this.exchangeForm.invalid) {
      this.exchangeForm.markAllAsTouched();

      return;
    }

    const formValue = this.exchangeForm.getRawValue();
    const session: LearningSession = {
      hostId: currentProfile.id,
      partnerId: partner.id,
      topic: formValue.topic,
      startsAt: new Date(formValue.startsAt).toISOString(),
      durationMinutes: formValue.durationMinutes,
      status: 'pending',
      notes: 'Ожидает подтверждения партнёром',
    };

    this.store.proposeExchange(partner).subscribe({
      next: () => {
        this.store.scheduleSession(session).subscribe({
          next: () => {
            this.actionMessage.set('Предложение отправлено');
            this.closeExchange();
          },
          error: (error: Error) => this.actionError.set(error.message),
        });
      },
      error: (error: Error) => this.actionError.set(error.message),
    });
  }

  private defaultSessionDateTime(): string {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(18, 0, 0, 0);

    const timezoneOffsetMs = nextDay.getTimezoneOffset() * 60_000;

    return new Date(nextDay.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
  }

  private parseRating(value: string): number {
    return Number(value.slice(0, 1));
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
