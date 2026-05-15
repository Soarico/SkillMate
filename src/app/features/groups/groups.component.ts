import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiNotification } from '@taiga-ui/core';
import { TuiTextfield } from '@taiga-ui/core/components/textfield';
import { TuiBadge } from '@taiga-ui/kit';

import { SkillGroup } from '../../core/models/skillmate.models';
import { SkillmateStore } from '../../core/state/skillmate.store';

@Component({
  selector: 'app-groups',
  imports: [ReactiveFormsModule, TuiButton, TuiNotification, TuiBadge, TuiTextfield],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent implements OnInit {
  protected readonly store = inject(SkillmateStore);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly groupToDelete = signal<SkillGroup | null>(null);
  protected readonly selectedGroupId = signal<number | null>(null);
  protected readonly selectedGroup = computed(() => {
    const selectedId = this.selectedGroupId();

    return this.store.groups().find((group) => group.id === selectedId) ?? null;
  });
  protected readonly groupForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    interest: ['', [Validators.required]],
  });
  protected readonly materialForm = this.formBuilder.nonNullable.group({
    groupTitle: ['', [Validators.required]],
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
    const group = this.store.groups().find((item) => item.title === formValue.groupTitle);

    if (!group) {
      this.error.set('Группа не найдена');

      return;
    }

    this.store.addMaterial(group, formValue.title, formValue.url).subscribe({
      next: () => {
        this.message.set('Материал добавлен в группу');
        this.materialForm.reset({ groupTitle: '', title: '', url: '' });
      },
      error: (error: Error) => this.error.set(error.message),
    });
  }

  protected openGroup(group: SkillGroup): void {
    this.message.set(null);
    this.error.set(null);
    this.selectedGroupId.set(group.id ?? null);
  }

  protected closeGroup(): void {
    this.selectedGroupId.set(null);
  }

  protected memberName(memberId: number): string {
    const profile = this.store
      .partners()
      .find((partner) => String(partner.id) === String(memberId));

    return profile?.name ?? `Участник #${memberId}`;
  }

  protected groupTitles(): string[] {
    return this.store.groups().map((group) => group.title);
  }

  protected removeMember(group: SkillGroup, memberId: number): void {
    this.store.removeGroupMember(group, memberId).subscribe({
      next: () => this.message.set(`Участник ${this.memberName(memberId)} удалён из группы`),
      error: (error: Error) => this.error.set(error.message),
    });
  }

  protected removeMaterial(group: SkillGroup, materialIndex: number, materialTitle: string): void {
    this.store.removeGroupMaterial(group, materialIndex).subscribe({
      next: () => this.message.set(`Материал «${materialTitle}» удалён`),
      error: (error: Error) => this.error.set(error.message),
    });
  }

  protected requestDeleteGroup(group: SkillGroup): void {
    this.message.set(null);
    this.error.set(null);
    this.closeGroup();
    this.groupToDelete.set(group);
  }

  protected cancelDeleteGroup(): void {
    this.groupToDelete.set(null);
  }

  protected confirmDeleteGroup(): void {
    const group = this.groupToDelete();

    if (!group?.id) {
      this.error.set('Группа не найдена');
      this.groupToDelete.set(null);

      return;
    }

    this.store.removeGroup(group.id).subscribe({
      next: () => {
        this.message.set(`Группа «${group.title}» удалена`);
        this.groupToDelete.set(null);
      },
      error: (error: Error) => this.error.set(error.message),
    });
  }
}
