import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterThemeDropdownComponent } from './footer-theme-dropdown.component';

describe('FooterThemeDropdownComponent', () => {
  let component: FooterThemeDropdownComponent;
  let fixture: ComponentFixture<FooterThemeDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterThemeDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterThemeDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
