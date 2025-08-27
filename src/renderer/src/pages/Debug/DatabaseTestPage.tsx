import React, { useState, useEffect } from 'react';

const DatabaseTestPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState('');

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await window.api.clients.getAll();
      setClients(data);
      console.log('Clientes carregados:', data);
      
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const testCreateClient = async () => {
    try {
      setTestResult('Criando cliente de teste...');
      
      const testClient = {
        tipoPessoa: 'PJ',
        razaoSocial: 'Teste Database LTDA',
        nomeFantasia: 'Teste DB',
        cpfCnpj: '12345678000199',
        indicadorIE: 'Contribuinte',
        ie: '123456789',
        regimeTrib: 'Simples Nacional',
        email: 'teste@db.com',
        telefone: '11999999999',
        cep: '01234567',
        logradouro: 'Rua Teste',
        cidade: 'São Paulo',
        uf: 'SP',
        pais: 'Brasil',
        transportePadrao: 'CIF',
        limiteCredito: 1000
      };

      const savedClient = await window.api.clients.create(testClient);
      setTestResult(`✅ Cliente criado com ID: ${savedClient.id}`);
      
      // Recarregar lista
      await loadClients();
      
    } catch (err) {
      setTestResult(`❌ Erro: ${err.message}`);
      console.error('Erro ao criar cliente:', err);
    }
  };

  const clearAllClients = async () => {
    try {
      setTestResult('Removendo todos os clientes...');
      
      for (const client of clients) {
        await window.api.clients.delete(client.id);
      }
      
      setTestResult(`✅ ${clients.length} clientes removidos`);
      await loadClients();
      
    } catch (err) {
      setTestResult(`❌ Erro ao limpar: ${err.message}`);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Teste de Database</h1>
      
      <div className="grid gap-6">
        {/* Controles */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Controles</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={loadClients}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : '🔄 Recarregar'}
            </button>
            
            <button
              onClick={testCreateClient}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ➕ Criar Cliente Teste
            </button>
            
            <button
              onClick={clearAllClients}
              disabled={clients.length === 0}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              🗑️ Limpar Todos
            </button>
          </div>
          
          {testResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm font-mono">
              {testResult}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Status</h2>
          {loading && <p className="text-blue-600">⏳ Carregando...</p>}
          {error && <p className="text-red-600">❌ Erro: {error}</p>}
          {!loading && !error && (
            <p className="text-green-600">✅ Conectado ao banco - {clients.length} clientes</p>
          )}
        </div>

        {/* Lista de Clientes */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Clientes no Banco ({clients.length})</h2>
          
          {clients.length === 0 ? (
            <p className="text-gray-500">Nenhum cliente cadastrado</p>
          ) : (
            <div className="grid gap-3">
              {clients.map((client) => (
                <div key={client.id} className="border rounded p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{client.razao_social}</h3>
                      {client.nome_fantasia && (
                        <p className="text-gray-600">{client.nome_fantasia}</p>
                      )}
                      <p className="text-gray-500">CNPJ: {client.cpf_cnpj}</p>
                      <p className="text-gray-500">Email: {client.email || 'N/A'}</p>
                      <p className="text-gray-500">Cidade: {client.cidade || 'N/A'}, {client.uf || 'N/A'}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>ID: {client.id}</p>
                      <p>Criado: {new Date(client.created_at).toLocaleDateString()}</p>
                      <button
                        onClick={async () => {
                          try {
                            await window.api.clients.delete(client.id);
                            await loadClients();
                          } catch (err) {
                            alert(`Erro: ${err.message}`);
                          }
                        }}
                        className="mt-2 px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Debug Info</h2>
          <div className="text-sm font-mono space-y-1">
            <p>• window.api disponível: {window.api ? '✅' : '❌'}</p>
            <p>• window.api.clients disponível: {window.api?.clients ? '✅' : '❌'}</p>
            <p>• Métodos disponíveis: {window.api?.clients ? Object.keys(window.api.clients).join(', ') : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTestPage;