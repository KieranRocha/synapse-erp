import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useClientSearch } from './useClientSearch';

// Mock the API
const mockSearch = vi.fn();
global.window.api = {
  clients: {
    search: mockSearch,
  },
};

describe('useClientSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should initialize with empty values', () => {
    const { result } = renderHook(() => useClientSearch());

    expect(result.current.searchTerm).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.showDropdown).toBe(false);
    expect(result.current.selectedClient).toBeNull();
  });

  it('should update search term', () => {
    const { result } = renderHook(() => useClientSearch());

    act(() => {
      result.current.setSearchTerm('test');
    });

    expect(result.current.searchTerm).toBe('test');
  });

  it('should perform search when term is long enough', async () => {
    const mockResults = [
      {
        id: 1,
        razao_social: 'Test Company',
        cpf_cnpj: '12345678901234',
      },
    ];
    mockSearch.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useClientSearch());

    act(() => {
      result.current.setSearchTerm('test search');
    });

    // Fast-forward debounce timer and wait for promises
    await act(async () => {
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();
    });

    expect(mockSearch).toHaveBeenCalledWith('test search');
    expect(result.current.searchResults).toEqual(mockResults);
    expect(result.current.showDropdown).toBe(true);
    expect(result.current.isSearching).toBe(false);
  });

  it('should not search when term is too short', () => {
    const { result } = renderHook(() => useClientSearch());

    act(() => {
      result.current.setSearchTerm('t');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockSearch).not.toHaveBeenCalled();
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.showDropdown).toBe(false);
  });

  it('should handle search errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSearch.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useClientSearch());

    act(() => {
      result.current.setSearchTerm('test error');
    });

    // Fast-forward debounce timer and wait for promises
    await act(async () => {
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();
    });

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.showDropdown).toBe(false);
    expect(result.current.isSearching).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro na busca:', expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });

  it('should select client correctly', () => {
    const { result } = renderHook(() => useClientSearch());
    
    const mockClient = {
      id: 1,
      razao_social: 'Test Company',
      nome_fantasia: 'Test',
      cpf_cnpj: '12345678901234',
    };

    act(() => {
      result.current.selectClient(mockClient);
    });

    expect(result.current.selectedClient).toEqual(mockClient);
    expect(result.current.searchTerm).toBe('Test');
    expect(result.current.showDropdown).toBe(false);
  });

  it('should clear selection correctly', () => {
    const { result } = renderHook(() => useClientSearch());
    
    const mockClient = {
      id: 1,
      razao_social: 'Test Company',
      cpf_cnpj: '12345678901234',
    };

    // First select a client
    act(() => {
      result.current.selectClient(mockClient);
    });

    expect(result.current.selectedClient).toEqual(mockClient);

    // Then clear selection
    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedClient).toBeNull();
    expect(result.current.searchTerm).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.showDropdown).toBe(false);
  });

  it('should use razao_social when nome_fantasia is not available', () => {
    const { result } = renderHook(() => useClientSearch());
    
    const mockClient = {
      id: 1,
      razao_social: 'Test Company',
      cpf_cnpj: '12345678901234',
    };

    act(() => {
      result.current.selectClient(mockClient);
    });

    expect(result.current.searchTerm).toBe('Test Company');
  });
});