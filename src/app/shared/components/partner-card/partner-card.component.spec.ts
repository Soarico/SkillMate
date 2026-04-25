import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerMatch } from '../../../core/models/skillmate.models';
import { toSkill } from '../../utils/compatibility.util';
import { PartnerCardComponent } from './partner-card.component';

const partner: PartnerMatch = {
  id: 2,
  name: 'Марк Ильин',
  email: 'mark@student.test',
  city: 'Казань',
  avatarUrl: '',
  about: 'Учит Figma',
  teachSkills: [toSkill('Figma', 0, 'Design')],
  learnSkills: [toSkill('TypeScript', 0, 'Frontend')],
  interests: ['design'],
  progress: [],
  rating: 4.9,
  reviewCount: 18,
  compatibility: 88,
  matchedTeachSkills: ['Figma'],
  matchedLearnSkills: ['TypeScript'],
};

describe('PartnerCardComponent', () => {
  let fixture: ComponentFixture<PartnerCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerCardComponent);
    fixture.componentRef.setInput('partner', partner);
    fixture.detectChanges();
  });

  it('renders partner name and compatibility', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Марк Ильин');
    expect(element.textContent).toContain('88%');
  });

  it('emits propose event with selected partner', () => {
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.propose, 'emit');

    component.propose.emit(partner);

    expect(emitSpy).toHaveBeenCalledWith(partner);
  });
});
