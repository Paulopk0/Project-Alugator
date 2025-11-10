/**
 * Mapeamento de assets de imagens de items
 * As chaves devem corresponder aos valores salvos no banco de dados
 * 
 * No React Native, usar require() diretamente no objeto permite acesso dinâmico
 */

const itemImages = {
  // Ferramentas
  parafusadeira: require('./items/parafusadeira.png'),
  furadeira: require('./items/furadeira.png'),
  escada: require('./items/escada.png'),

  // Móveis
  guarda_roupa: require('./items/guarda_roupa.png'),
  mesa_escritorio: require('./items/mesa_escritorio.png'),
  sofa: require('./items/sofa.png'),

  // Esportes
  bicicleta: require('./items/bicicleta.png'),

  // Camping
  barraca: require('./items/barraca.png'),

  // Placeholder padrão caso a imagem não exista
  default: require('./items/default.png')
};

/**
 * Função para obter a imagem de um item
 * @param {string|array} photoName - Nome da foto vindo do backend (string ou array)
 * @returns {any} - Asset da imagem
 */
export const getItemImage = (photoName) => {
  if (!photoName) return itemImages.default;
  
  // Se vier como array, pega o primeiro elemento
  if (Array.isArray(photoName)) {
    photoName = photoName[0];
  }
  
  // Se ainda não for string, retorna default
  if (typeof photoName !== 'string') {
    return itemImages.default;
  }
  
  // Remove extensão se vier do backend com ela
  const cleanName = photoName.replace(/\.(png|jpg|jpeg)$/i, '');
  
  return itemImages[cleanName] || itemImages.default;
};

/**
 * Função para obter múltiplas imagens
 * @param {string} photos - String ou array de nomes de fotos
 * @returns {array} - Array de assets
 */
export const getItemImages = (photos) => {
  if (!photos) return [itemImages.default];
  
  // Se vier como string separada por vírgula
  if (typeof photos === 'string') {
    const photoArray = photos.split(',').map(p => p.trim());
    return photoArray.map(photo => getItemImage(photo));
  }
  
  // Se vier como array
  if (Array.isArray(photos)) {
    return photos.map(photo => getItemImage(photo));
  }
  
  return [itemImages.default];
};

export default itemImages;
