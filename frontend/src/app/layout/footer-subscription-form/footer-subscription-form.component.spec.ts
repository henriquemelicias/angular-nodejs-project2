import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterSubscriptionFormComponent } from './footer-subscription-form.component';

describe('FooterSubscriptionFormComponent', () => {
  let component: FooterSubscriptionFormComponent;
  let fixture: ComponentFixture<FooterSubscriptionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterSubscriptionFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterSubscriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
