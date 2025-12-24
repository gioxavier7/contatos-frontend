import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { ContactViewComponent } from './contact-view.component';
import { ContatosService } from '../../../services/contatos.service';

describe('ContactViewComponent', () => {
  let component: ContactViewComponent;
  let fixture: ComponentFixture<ContactViewComponent>;
  let contatosService: ContatosService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactViewComponent,
        FormsModule
      ],
      providers: [ContatosService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactViewComponent);
    component = fixture.componentInstance;
    contatosService = TestBed.inject(ContatosService);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.formData.nome).toBe('');
    expect(component.formData.email).toBe('');
    expect(component.formData.data_nascimento).toBe('');
    expect(component.formData.profissao).toBe('');
    expect(component.formData.celular).toBe('');
  });

  it('should validate email correctly', () => {
    expect(component.validarEmail('test@email.com')).toBe(true); 
    expect(component.validarEmail('invalid-email')).toBe(false);
  });

  it('should calculate age correctly', () => {
    const birthDate = '1990-01-01';
    const age = component.calcularIdade(birthDate);
    expect(age).toBeGreaterThan(0);
  });

  it('should format phone number correctly', () => {
    expect(component.formatarTelefone('11987654321')).toContain('(11) 98765-4321');
    expect(component.formatarTelefone('1133334444')).toContain('(11) 3333-4444');
  });

  it('should clean phone number correctly', () => {
    expect(component.limparTelefone('(11) 98765-4321')).toBe('11987654321');
    expect(component.limparTelefone('11 3333-4444')).toBe('1133334444');
  });
});