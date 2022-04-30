import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterScrollUpButtonComponent } from './footer-scroll-up-button.component';

describe('FooterScrollUpButtonComponent', () => {
  let component: FooterScrollUpButtonComponent;
  let fixture: ComponentFixture<FooterScrollUpButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterScrollUpButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterScrollUpButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
