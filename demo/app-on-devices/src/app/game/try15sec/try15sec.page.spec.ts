import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Try15secPage } from './try15sec.page';

describe('Try15secPage', () => {
  let component: Try15secPage;
  let fixture: ComponentFixture<Try15secPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Try15secPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
