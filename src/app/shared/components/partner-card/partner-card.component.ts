import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge, TuiProgress } from '@taiga-ui/kit';
import { TuiCard } from '@taiga-ui/layout';

import { PartnerMatch } from '../../../core/models/skillmate.models';

@Component({
  selector: 'app-partner-card',
  imports: [TuiButton, TuiBadge, TuiProgress, TuiCard],
  templateUrl: './partner-card.component.html',
  styleUrl: './partner-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerCardComponent {
  @Input({ required: true }) partner!: PartnerMatch;
  @Output() readonly propose = new EventEmitter<PartnerMatch>();
  @Output() readonly inviteToGroup = new EventEmitter<PartnerMatch>();
  @Output() readonly review = new EventEmitter<PartnerMatch>();
}
