import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TerminalPage } from './terminal.page';

describe('TerminalPage', () => {
  let component: TerminalPage;
  let fixture: ComponentFixture<TerminalPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TerminalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
