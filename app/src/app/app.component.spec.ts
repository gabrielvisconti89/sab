import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  beforeEach(async () => {
    const storageSpy = jasmine.createSpyObj('Storage', ['create', 'get', 'set', 'remove']);
    storageSpy.create.and.returnValue(Promise.resolve(storageSpy));

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: Storage, useValue: storageSpy }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
