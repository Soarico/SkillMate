import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiNotification } from '@taiga-ui/core';
import { TuiProgress } from '@taiga-ui/kit';

import { SkillmateStore } from '../../core/state/skillmate.store';
import { splitList, toSkill } from '../../shared/utils/compatibility.util';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, TuiButton, TuiNotification, TuiProgress],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  protected readonly store = inject(SkillmateStore);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly saved = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    city: ['', [Validators.required]],
    about: ['', [Validators.required, Validators.minLength(20)]],
    teachSkills: ['', [Validators.required]],
    learnSkills: ['', [Validators.required]],
    interests: ['', [Validators.required]],
  });

  private readonly syncProfile = effect(() => {
    const profile = this.store.currentProfile();

    if (!profile || this.form.dirty) {
      return;
    }

    this.form.patchValue({
      name: profile.name,
      city: profile.city,
      about: profile.about,
      teachSkills: profile.teachSkills.map((skill) => skill.name).join(', '),
      learnSkills: profile.learnSkills.map((skill) => skill.name).join(', '),
      interests: profile.interests.join(', '),
    });
  });

  ngOnInit(): void {
    this.store.loadWorkspace();
  }

  protected save(): void {
    const profile = this.store.currentProfile();

    if (!profile || this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();
    const updatedProfile = {
      ...profile,
      name: value.name,
      city: value.city,
      about: value.about,
      teachSkills: splitList(value.teachSkills).map((skill, index) => toSkill(skill, index, 'Teaching')),
      learnSkills: splitList(value.learnSkills).map((skill, index) => toSkill(skill, index, 'Learning')),
      interests: splitList(value.interests),
    };

    this.saved.set(false);
    this.error.set(null);

    this.store.saveProfile(updatedProfile).subscribe({
      next: () => {
        this.form.markAsPristine();
        this.saved.set(true);
      },
      error: (error: Error) => this.error.set(error.message),
    });
  }
}
