import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillFieldComponent } from '../fill-field/fill-field.component';

describe('FillField', () => {
  let component: FillFieldComponent;
  let fixture: ComponentFixture<FillFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FillFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FillFieldComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
