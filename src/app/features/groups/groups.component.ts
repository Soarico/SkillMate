import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiNotification } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

import { SkillGroup } from '../../core/models/skillmate.models';
import { SkillmateStore } from '../../core/state/skillmate.store';

@Component({
  selector: 'app-groups',
  imports: [ReactiveFormsModule, TuiButton, TuiNotification, TuiBadge],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent implements OnInit {
  protected readonly store = inject(SkillmateStore);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly groupForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    interest: ['', [Validators.required]],
  });
  protected readonly materialForm = this.formBuilder.nonNullable.group({
    groupId: [0, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required]],
    url: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.store.loadWorkspace();
  }

  protected createGroup(): void {
    const currentProfile = this.store.currentProfile();

    if (!currentProfile || this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();

      return;
    }

    const formValue = this.groupForm.getRawValue();
    const group: SkillGroup = {
      title: formValue.title,
      description: formValue.description,
      interest: formValue.interest,
      ownerId: currentProfile.id,
      memberIds: [currentProfile.id],
      materials: [],
    };

    this.store.createGroup(group).subscribe({
      next: () => {
        this.message.set('Группа создана');
        this.groupForm.reset({ title: '', description: '', interest: '' });
      },
      error: (error: Error) => this.error.set(error.message),
    });
  }

  protected addMaterial(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();

      return;
    }

    const formValue = this.materialForm.getRawValue();
    const group = this.store.groups().find((item) => item.id === formValue.groupId);

    if (!group) {
      this.error.set('Группа не найдена');

      return;
    }

    this.store.addMaterial(group, formValue.title, formValue.url).subscribe({
      next: () => {
        this.message.set('Материал добавлен в группу');
        this.materialForm.reset({ groupId: 0, title: '', url: '' });
      },
      error: (error: Error) => this.error.set(error.message),
    });
  }
}
