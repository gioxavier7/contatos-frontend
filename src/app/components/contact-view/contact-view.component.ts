import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FillFieldComponent } from '../fill-field/fill-field.component';
import { 
  ContatosService, 
  type Contato, 
  type CriarContatoInput, 
  type EditarContatoInput,
  type ApiResponse 
} from '../../../services';

@Component({
  selector: 'app-contact-view',
  standalone: true,
  imports: [CommonModule, FormsModule, FillFieldComponent],
  templateUrl: './contact-view.component.html',
  styleUrls: ['./contact-view.component.css']
})
export class ContactViewComponent implements OnInit {
  //dados do formulário
  formData = {
    nome: '',
    email: '',
    data_nascimento: '',
    profissao: '',
    celular: '',
    telefone: '',
    possui_whatsapp: false,
    notifica_sms: false,
    notifica_email: false,
  };

  //listas
  contatos: Contato[] = [];
  contatosFiltrados: Contato[] = [];
  searchTerm: string = '';
  
  //estados
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  idadeError: string = '';
  
  //modos
  isEditMode: boolean = false;
  contatoEditandoId: number | null = null;
  
  //modais
  showModalVisualizacao: boolean = false;
  showModalConfirmacao: boolean = false;
  contatoVisualizando: Contato | null = null;
  contatoDeletandoId: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.carregarContatos();
  }

  async carregarContatos() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      const response = await ContatosService.listarTodosLegacy();
      
      console.log('Resposta completa:', response);
      console.log('Success:', response.success);
      console.log('Data:', response.data);
      console.log('Tipo de data:', typeof response.data);
      
      if (response.success) {
        //a api retorna os dados diretamente em response.data
        const contatosArray = response.data || [];
        
        console.log('Contatos array:', contatosArray);
        console.log('Número de contatos:', contatosArray.length);
        
        //mapear os booleanos (0/1 → true/false)
        this.contatos = contatosArray.map((contato: any) => ({
          id: contato.id,
          nome: contato.nome,
          email: contato.email,
          data_nascimento: contato.data_nascimento,
          profissao: contato.profissao,
          celular: contato.celular,
          telefone: contato.telefone || '',
          possui_whatsapp: Boolean(contato.possui_whatsapp),
          notifica_sms: Boolean(contato.notifica_sms),
          notifica_email: Boolean(contato.notifica_email),
          created_at: contato.created_at,
          updated_at: contato.updated_at
        }));
        
        this.contatosFiltrados = [...this.contatos];
        
        console.log('Contatos mapeados:', this.contatos);
      } else {
        console.log('Erro na resposta:', response.message);
        this.errorMessage = response.message || 'Erro ao carregar contatos';
        this.contatos = [];
        this.contatosFiltrados = [];
      }
    } catch (error: any) {
      console.error('Erro completo no carregarContatos:', error);
      this.errorMessage = error.message || 'Erro ao carregar contatos';
      this.contatos = [];
      this.contatosFiltrados = [];
    } finally {
      this.isLoading = false;
      console.log('=== FINALIZADO carregarContatos() ===');
      console.log('isLoading:', this.isLoading);
      console.log('contatos.length:', this.contatos.length);
      
      //forçar detecção de mudanças
      this.cdr.detectChanges();
      console.log('Change detection executado');
    }
  }

  //busca local (instantânea)
  buscarContatos() {
    if (!this.searchTerm.trim()) {
      this.contatosFiltrados = [...this.contatos];
      return;
    }

    const termo = this.searchTerm.toLowerCase().trim();
    
    this.contatosFiltrados = this.contatos.filter(contato => {
      //busca apenas em nome, profissão e email
      return (
        contato.nome?.toLowerCase().includes(termo) ||
        contato.profissao?.toLowerCase().includes(termo) ||
        contato.email?.toLowerCase().includes(termo)
      );
    });
  }

  //busca na API
  async buscarContatosAPI() {
    const termo = this.searchTerm.trim();
    
    if (!termo) {
      await this.carregarContatos();
      return;
    }

    try {
      this.isLoading = true;
      console.log('Buscando na API com termo:', termo);
      
      let response;
      
      //primeiro tenta buscar por nome
      response = await ContatosService.listarTodos({ nome: termo });
      console.log('Busca por nome - resposta:', response);
      
      //se não encontrou por nome, tenta por profissão
      if (response.success && (!response.data || response.data.length === 0)) {
        console.log('Nenhum resultado por nome, tentando por profissão...');
        response = await ContatosService.listarTodos({ profissao: termo });
        console.log('Busca por profissão - resposta:', response);
      }
      
      if (response.success && response.data) {
        const contatosArray = response.data || [];
        
        this.contatosFiltrados = contatosArray.map((contato: any) => ({
          id: contato.id,
          nome: contato.nome,
          email: contato.email,
          data_nascimento: contato.data_nascimento,
          profissao: contato.profissao,
          celular: contato.celular,
          telefone: contato.telefone || '',
          possui_whatsapp: Boolean(contato.possui_whatsapp),
          notifica_sms: Boolean(contato.notifica_sms),
          notifica_email: Boolean(contato.notifica_email),
          created_at: contato.created_at,
          updated_at: contato.updated_at
        }));
        
        console.log('Contatos encontrados na busca:', this.contatosFiltrados.length);
      } else {
        console.log('Nenhum resultado encontrado na API');
        this.contatosFiltrados = [];
      }
    } catch (error) {
      console.error('Erro na busca API:', error);
      //em caso de erro, faz busca local como fallback
      this.buscarContatos();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  //limpar busca
  limparBusca() {
    this.searchTerm = '';
    this.carregarContatos();
  }

  async salvarContato() {
    if (!this.validarFormulario()) return;

    try {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      console.log('Iniciando salvarContato...');

      const dataFormatada = this.formatarDataParaAPI(this.formData.data_nascimento);
      const celularLimpo = this.limparTelefone(this.formData.celular);
      const telefoneLimpo = this.formData.telefone ? this.limparTelefone(this.formData.telefone) : undefined;

      let response;
      
      if (this.isEditMode && this.contatoEditandoId) {
        const dadosEdicao: EditarContatoInput = {
          nome: this.formData.nome,
          email: this.formData.email,
          data_nascimento: dataFormatada,
          profissao: this.formData.profissao,
          celular: celularLimpo,
          telefone: telefoneLimpo,
          possui_whatsapp: this.formData.possui_whatsapp,
          notifica_sms: this.formData.notifica_sms,
          notifica_email: this.formData.notifica_email,
        };

        console.log('Editando contato ID:', this.contatoEditandoId, 'dados:', dadosEdicao);
        response = await ContatosService.editar(this.contatoEditandoId, dadosEdicao);
      } else {
        const novoContato: CriarContatoInput = {
          nome: this.formData.nome,
          email: this.formData.email,
          data_nascimento: dataFormatada,
          profissao: this.formData.profissao,
          celular: celularLimpo,
          possui_whatsapp: this.formData.possui_whatsapp,
          notifica_sms: this.formData.notifica_sms,
          notifica_email: this.formData.notifica_email,
        };

        if (telefoneLimpo && telefoneLimpo.length >= 8) {
          novoContato.telefone = telefoneLimpo;
        }

        console.log('Criando novo contato:', novoContato);
        response = await ContatosService.criar(novoContato);
      }

      console.log('Resposta da API:', response);
      
      if (response.success) {
        this.successMessage = response.message || 
          (this.isEditMode ? 'Contato atualizado com sucesso!' : 'Contato criado com sucesso!');
        
        if (this.isEditMode) {
          this.cancelarEdicao();
        } else {
          this.limparFormulario();
        }
        
        //atualiza a lista de contatos
        console.log('Atualizando lista de contatos...');
        await this.carregarContatos();
        
        //limpa a mensagem de sucesso após 3 segundos
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      } else {
        //se a api retornou success: false
        this.errorMessage = response.message || 'Erro ao salvar contato. Tente novamente.';
      }
      
    } catch (error: any) {
      console.error('Erro completo no salvarContato:', error);
      this.errorMessage = error.message || 'Erro ao salvar contato';
    } finally {
      console.log('Finalizando salvarContato');
      this.isSubmitting = false;
      this.cdr.detectChanges(); //força atualização da view
    }
  }

  visualizarContato(contato: Contato) {
    this.contatoVisualizando = contato;
    this.showModalVisualizacao = true;
  }

  fecharModalVisualizacao() {
    this.showModalVisualizacao = false;
    this.contatoVisualizando = null;
  }

  editarContato(contato: Contato) {
    this.isEditMode = true;
    this.contatoEditandoId = contato.id;
    
    this.formData.nome = contato.nome;
    this.formData.email = contato.email;
    this.formData.data_nascimento = this.formatarDataParaInput(contato.data_nascimento);
    this.formData.profissao = contato.profissao;
    this.formData.celular = contato.celular;
    this.formData.telefone = contato.telefone || '';
    this.formData.possui_whatsapp = contato.possui_whatsapp;
    this.formData.notifica_sms = contato.notifica_sms;
    this.formData.notifica_email = contato.notifica_email;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.isEditMode = false;
    this.contatoEditandoId = null;
    this.limparFormulario();
  }

  abrirModalDeletar(id: number) {
    this.contatoDeletandoId = id;
    this.showModalConfirmacao = true;
  }

  fecharModalConfirmacao() {
    this.showModalConfirmacao = false;
    this.contatoDeletandoId = null;
  }

  async confirmarDelecao() {
    if (!this.contatoDeletandoId) return;

    try {
      const response = await ContatosService.deletar(this.contatoDeletandoId);
      if (response.success) {
        this.successMessage = response.message || 'Contato deletado com sucesso!';
        await this.carregarContatos();
        this.fecharModalConfirmacao();
        setTimeout(() => this.successMessage = '', 3000);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao deletar contato';
      console.error('Erro ao deletar contato:', error);
    }
  }

  validarFormulario(): boolean {
    this.errorMessage = '';
    
    if (!this.formData.nome.trim()) {
      this.errorMessage = 'Nome é obrigatório';
      return false;
    }

    if (!this.formData.email || !this.validarEmail(this.formData.email)) {
      this.errorMessage = 'Email inválido';
      return false;
    }

    if (!this.formData.data_nascimento) {
      this.errorMessage = 'Data de nascimento é obrigatória';
      return false;
    }

    if (!this.validarIdade()) {
      this.errorMessage = this.idadeError;
      return false;
    }

    if (!this.formData.profissao.trim()) {
      this.errorMessage = 'Profissão é obrigatória';
      return false;
    }

    const celularLimpo = this.limparTelefone(this.formData.celular);
    if (!celularLimpo || celularLimpo.length < 10) {
      this.errorMessage = 'Celular inválido (mínimo 10 dígitos)';
      return false;
    }

    return true;
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  calcularIdade(dataNascimento: string): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  }

  validarIdade(): boolean {
    if (!this.formData.data_nascimento) {
      this.idadeError = '';
      return true;
    }

    const idade = this.calcularIdade(this.formData.data_nascimento);
    
    if (idade < 18) {
      this.idadeError = 'Não é permitido cadastrar menores de idade (mínimo 18 anos)';
      return false;
    }
    
    if (idade > 100) {
      this.idadeError = 'Data de nascimento inválida (idade máxima: 100 anos)';
      return false;
    }
    
    this.idadeError = '';
    return true;
  }

  onDataNascimentoChange() {
    this.validarIdade();
  }

  limparTelefone(telefone: string): string {
    return telefone.replace(/\D/g, '');
  }

  formatarDataParaAPI(data: string): string {
    if (data.includes('-') && data.split('-')[0].length === 4) {
      return data;
    }
    
    const parts = data.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    
    return data;
  }

  formatarDataParaInput(data: string): string {
    if (data.includes('-') && data.split('-')[0].length === 4) {
      return data;
    }
    
    const parts = data.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    
    return data;
  }

  formatarDataParaExibicao(data: string): string {
    const parts = data.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    const partsBR = data.split('/');
    if (partsBR.length === 3 && partsBR[2].length === 4) {
      return data;
    }
    
    return data;
  }

  formatarTelefone(numero: string): string {
    if (!numero || numero.trim() === '') return '-';
    
    const limpo = this.limparTelefone(numero);
    
    if (limpo.length === 11) {
      return `(${limpo.substring(0,2)}) ${limpo.substring(2,7)}-${limpo.substring(7)}`;
    } else if (limpo.length === 10) {
      return `(${limpo.substring(0,2)}) ${limpo.substring(2,6)}  ${limpo.substring(6)}`;
    }
    
    return numero;
  }

  formatarDataHora(dataHora: string | undefined): string {
    if (!dataHora) return '-';
    
    const date = new Date(dataHora);
    if (isNaN(date.getTime())) {
      return dataHora;
    }
    
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${minutos}`;
  }

  limparFormulario() {
    this.formData = {
      nome: '',
      email: '',
      data_nascimento: '',
      profissao: '',
      celular: '',
      telefone: '',
      possui_whatsapp: false,
      notifica_sms: false,
      notifica_email: false,
    };
    this.errorMessage = '';
    this.idadeError = '';
  }
}