import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiNotification } from '@taiga-ui/core';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TuiButton, TuiNotification],
  templateUrl: './register.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirm: ['', [Validators.required, Validators.minLength(6)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    about: ['', [Validators.required, Validators.minLength(20)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const formValue = this.form.getRawValue();

    if (formValue.password !== formValue.passwordConfirm) {
      this.error.set('Пароли должны совпадать');
      this.form.controls.passwordConfirm.setErrors({ mismatch: true });

      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth
      .register({
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        city: formValue.city,
        about: formValue.about,
      })
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: (error: Error) => {
          this.error.set(error.message);
          this.loading.set(false);
        },
      });
  }
}
