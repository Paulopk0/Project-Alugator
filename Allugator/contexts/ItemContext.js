/**
 * ItemContext - Gerencia estado global de itens
 * 
 * Responsabilidades:
 * - Armazenar lista de todos os itens
 * - Armazenar meus itens (items que criei)
 * - Gerenciar favoritos
 * - Filtrar por categoria
 * - Atualizar estado de itens
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getAllItems } from '../apis/ItemApi';
import { getFavoriteIds, toggleFavorite as toggleFavoriteAPI } from '../apis/FavoriteApi';
import { getMyItemsWithRentals } from '../apis/ItemManagementApi';

export const ItemContext = createContext();

export function ItemProvider({ children }) {
  // Estado
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);

  /**
   * Carrega todos os itens disponíveis
   */
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllItems();
      setItems(response.items || response);
      setFilteredItems(response.items || response);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega itens do usuário logado
   */
  const loadMyItems = useCallback(async () => {
    try {
      const response = await getMyItemsWithRentals();
      // Trata o response - pode ser array direto ou objeto com items/myItems
      if (Array.isArray(response)) {
        setMyItems(response);
      } else if (response?.items && Array.isArray(response.items)) {
        setMyItems(response.items);
      } else if (response?.myItems && Array.isArray(response.myItems)) {
        setMyItems(response.myItems);
      } else {
        setMyItems([]); // Garante que é sempre array
      }
    } catch (error) {
      console.error('Erro ao carregar meus itens:', error);
      setMyItems([]); // Em caso de erro também
    }
  }, []);

  /**
   * Carrega IDs dos itens favoritados
   */
  const loadFavorites = useCallback(async () => {
    try {
      const response = await getFavoriteIds();
      // Trata o response - pode ser array direto ou objeto com favoriteIds
      if (Array.isArray(response)) {
        setFavorites(response);
      } else if (response?.favoriteIds && Array.isArray(response.favoriteIds)) {
        setFavorites(response.favoriteIds);
      } else if (response?.favorites && Array.isArray(response.favorites)) {
        setFavorites(response.favorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavorites([]);
    }
  }, []);

  /**
   * Filtra itens por categoria
   */
  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory(category);
    
    if (!category) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => item.category === category);
      setFilteredItems(filtered);
    }
  }, [items]);

  /**
   * Alterna favorito de um item
   */
  const handleToggleFavorite = useCallback(async (itemId) => {
    try {
      await toggleFavoriteAPI(itemId);
      
      // Atualiza lista de favoritos localmente - garante que é array
      setFavorites(prev => {
        const favArray = Array.isArray(prev) ? prev : [];
        return favArray.includes(itemId) 
          ? favArray.filter(id => id !== itemId)
          : [...favArray, itemId];
      });
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  }, []);

  /**
   * Atualiza um item específico
   */
  const updateItem = useCallback((itemId, updatedData) => {
    setItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, ...updatedData } : item)
    );
    
    setMyItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, ...updatedData } : item)
    );
  }, []);

  /**
   * Remove um item
   */
  const removeItem = useCallback((itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    setMyItems(prev => prev.filter(item => item.id !== itemId));
    setFilteredItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  /**
   * Faz refresh dos dados
   */
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        loadItems(),
        loadMyItems(),
        loadFavorites(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadItems, loadMyItems, loadFavorites]);

  /**
   * Retorna categorias únicas
   */
  const getCategories = useCallback(() => {
    const categories = [...new Set(items.map(item => item.category))];
    return categories.filter(Boolean);
  }, [items]);

  /**
   * Verifica se item é novo (< 7 dias)
   */
  const isNewItem = useCallback((publishDate) => {
    if (!publishDate) return false;
    const date = new Date(publishDate);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  }, []);

  /**
   * Conta quantos aluguéis ativas tem um item
   */
  const getRentedCount = useCallback((itemId) => {
    if (!Array.isArray(myItems)) return 0; // Protege contra myItems não ser array
    const item = myItems.find(i => i.id === itemId);
    return item?.activeRentals?.length || 0;
  }, [myItems]);

  /**
   * Valor do contexto
   */
  const value = {
    // Estado
    items,
    myItems,
    favorites,
    loading,
    refreshing,
    selectedCategory,
    filteredItems,

    // Ações
    loadItems,
    loadMyItems,
    loadFavorites,
    handleCategoryFilter,
    handleToggleFavorite,
    updateItem,
    removeItem,
    onRefresh,

    // Utilitários
    getCategories,
    isNewItem,
    getRentedCount,
    isFavorite: (itemId) => Array.isArray(favorites) ? favorites.includes(itemId) : false,
    filteredItemsCount: filteredItems.length,
  };

  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );
}
