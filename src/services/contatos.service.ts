import { fetchAPI } from './api/api.config';
import { 
  ApiResponse,
  Contato,
  CriarContatoInput,
  EditarContatoInput,
  ListarContatosParams,
  ListarContatosResponse,
  ApiResponsePaginated 
} from './types';

export class ContatosService {
  private static readonly BASE_ENDPOINT = '/contatos';

  static async listarTodos(params?: ListarContatosParams): Promise<ListarContatosResponse> {
    let endpoint = this.BASE_ENDPOINT;
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.nome) queryParams.append('nome', params.nome);
      if (params.profissao) queryParams.append('profissao', params.profissao);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    
    return fetchAPI<ListarContatosResponse>(endpoint, { method: 'GET' });
  }

  static async buscarPorId(id: number): Promise<ApiResponse<Contato>> {
    return fetchAPI<ApiResponse<Contato>>(`${this.BASE_ENDPOINT}/${id}`, { method: 'GET' });
  }

  static async criar(dados: CriarContatoInput): Promise<ApiResponse<Contato>> {
    const payload = {
      ...dados,
      possui_whatsapp: dados.possui_whatsapp || false,
      notifica_sms: dados.notifica_sms || false,
      notifica_email: dados.notifica_email || false,
    };

    return fetchAPI<ApiResponse<Contato>>(this.BASE_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async editar(id: number, dados: EditarContatoInput): Promise<ApiResponse<Contato>> {
    const payload = Object.fromEntries(
      Object.entries(dados).filter(([_, value]) => value !== undefined)
    );

    return fetchAPI<ApiResponse<Contato>>(`${this.BASE_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async deletar(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return fetchAPI<ApiResponse<{ success: boolean; message: string }>>(`${this.BASE_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  }

  static async listarTodosLegacy(): Promise<ApiResponse<Contato[]>> {
    try {
      const response = await this.listarTodos();
      
      //return da resposta
      return {
        success: response.success,
        data: response.data || [], //response.data já é Contato[]
        message: response.message || 'Contatos carregados com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || 'Erro ao carregar contatos',
      };
    }
  }
}