import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { DateValueAccessor } from './date-value-accessor';
import { dispatchInputEvent } from './spec-utils';

@Component({
  template: `
  <form>
    <input type="date" name="normalInput" [(ngModel)]="testDate1">
    <input type="date" name="fixedInput" [(ngModel)]="testDate2" useValueAsDate>
  </form>`
})
export class TestFormComponent {
  testDate1: Date | string;
  testDate2: Date;

  constructor() {
    this.testDate1 = new Date('2019-01-01'); // Create UTC Date
    this.testDate2 = new Date('2020-01-01'); // Create UTC Date
  }
}

describe('DateValueAccessor', () => {

  let fixture: ComponentFixture<TestFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestFormComponent, DateValueAccessor],
      imports: [FormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFormComponent);
  });

  beforeEach(waitForAsync(() => {
    // https://stackoverflow.com/questions/39582707/updating-input-html-field-from-within-an-angular-2-test
    fixture.detectChanges();
    fixture.whenStable();
  }));

  describe('without the "useValueAsDate" attribute', () => {

    let normalInput: DebugElement;
    beforeEach(() => normalInput = fixture.debugElement.query(By.css('input[name=normalInput]')));

    it('should NOT fix date input controls', () => {
      expect(normalInput.nativeElement.value).toBe('');
    });

    it('should populate simple strings on change', waitForAsync(() => {
      dispatchInputEvent(normalInput.nativeElement, '1984-09-30');
      expect(fixture.componentInstance.testDate1).toEqual('1984-09-30');
    }));
  });

  describe('with the "useValueAsDate" attribute', () => {

    let fixedInput: DebugElement;
    beforeEach(() => fixedInput = fixture.debugElement.query(By.css('input[name=fixedInput]')));

    it('should fix date input controls to bind on dates', waitForAsync(() => {
      expect(fixedInput.nativeElement.value).toBe('2020-01-01');
    }));

    it('should populate UTC dates (instead of strings) on change', waitForAsync(() => {
      dispatchInputEvent(fixedInput.nativeElement, '2020-12-31');
      expect(fixture.componentInstance.testDate2).toEqual(jasmine.any(Date));
      expect(fixture.componentInstance.testDate2).toEqual(new Date('2020-12-31'));
      expect(fixture.componentInstance.testDate2.getUTCDate()).toBe(31);
      expect(fixture.componentInstance.testDate2.getUTCMonth()).toBe(11);
      expect(fixture.componentInstance.testDate2.getUTCFullYear()).toBe(2020);
      expect(fixture.componentInstance.testDate2.getUTCHours()).toBe(0);
      expect(fixture.componentInstance.testDate2.getUTCMinutes()).toBe(0);
    }));
  });
});
