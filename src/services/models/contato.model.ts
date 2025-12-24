//tipos de resposta da api
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiResponsePaginated<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

//modelo de contato
export interface Contato {
  id: number;
  nome: string;
  email: string;
  data_nascimento: string; // YYYY-MM-DD
  profissao: string;
  celular: string;
  telefone?: string;
  possui_whatsapp: boolean;
  notifica_sms: boolean;
  notifica_email: boolean;
  created_at?: string;
  updated_at?: string;
}

//criação e edição
export interface CriarContatoInput {
  nome: string;
  email: string;
  data_nascimento: string; // YYYY-MM-DD
  profissao: string;
  celular: string;
  telefone?: string;
  possui_whatsapp?: boolean;
  notifica_sms?: boolean;
  notifica_email?: boolean;
}

export interface EditarContatoInput {
  nome?: string;
  email?: string;
  data_nascimento?: string; // YYYY-MM-DD
  profissao?: string;
  celular?: string;
  telefone?: string;
  possui_whatsapp?: boolean;
  notifica_sms?: boolean;
  notifica_email?: boolean;
}

//params para listagem
export interface ListarContatosParams {
  nome?: string;
  profissao?: string;
  page?: number;
  limit?: number;
}

export interface ListarContatosResponse extends ApiResponsePaginated<Contato[]> {}