// config base da api
const API_CONFIG = {
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

//requisições HTTP
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_CONFIG.baseURL}${endpoint}`;
  
  const config: RequestInit = { ...options };
  
  //add headers mantendo os existentes
  config.headers = {
    ...API_CONFIG.headers,
    ...options.headers,
  };

  //converte body para JSON se for objeto e ainda não for string
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    //se ainda não é string JSON, converter
    if (typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }
  }

  try {
    const response = await fetch(url, config);
    
    //para respostas vazias (como em DELETE)
    if (response.status === 204) {
      return {} as T;
    }
    
    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
      const errorMessage = data?.message || 
                          `Erro ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return data as T;
  } catch (error) {
    console.error(`Erro na requisição ${endpoint}:`, error);
    throw error;
  }
}

export { API_CONFIG };