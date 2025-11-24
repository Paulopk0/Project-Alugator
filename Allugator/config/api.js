// Altere esta URL para o IP/host do seu backend
// Altere esta URL para o IP/host do seu backend
// Normaliza a variável de ambiente removendo barras finais e garantindo sufixo '/api'.
const raw = process.env.EXPO_PUBLIC_API_URL;
// Base sem barras finais
let base = raw ? raw.replace(/\/+$/, '') : 'http://localhost:3000';
// Se o usuário não incluiu o sufixo '/api', adiciona para manter consistência
if (!base.endsWith('/api')) {
	base = base + '/api';
}

const API_URL = base;
export default API_URL;
