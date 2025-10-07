import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, FileText, Image as ImageIcon, File, Paperclip, X } from 'lucide-react';

interface AnexosClienteTabProps {
  clienteId: string;
}

interface Anexo {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  dataUpload: string;
  categoria: 'fiscal' | 'contrato' | 'comprovante' | 'outro';
  url?: string;
}

type CategoriaFilter = 'todos' | 'fiscal' | 'contrato' | 'comprovante' | 'outro';

export function AnexosClienteTab({ clienteId }: AnexosClienteTabProps) {
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaFilter>('todos');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAnexos = async () => {
      try {
        // TODO: Integrar com API real do backend
        // const anexosData = await window.api.clients.getAttachments(clienteId);
        // setAnexos(anexosData);

        // Aguardando integração - sem dados disponíveis
        setAnexos([]);
      } catch (error) {
        console.error('Erro ao carregar anexos:', error);
      }
    };

    loadAnexos();
  }, [clienteId]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-600" />;
    }
    if (tipo === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    return <File className="w-5 h-5 text-neutral-600" />;
  };

  const getCategoriaLabel = (categoria: Anexo['categoria']) => {
    const labels = {
      fiscal: 'Fiscal',
      contrato: 'Contrato',
      comprovante: 'Comprovante',
      outro: 'Outro'
    };
    return labels[categoria];
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Processar cada arquivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar tipo de arquivo
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          alert(`Tipo de arquivo não permitido: ${file.name}`);
          continue;
        }

        // Validar tamanho (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(`Arquivo muito grande: ${file.name}. Tamanho máximo: 10MB`);
          continue;
        }

        // TODO: Upload real para o backend
        // const result = await window.api.clients.uploadAttachment(clienteId, file);

        // Simular upload
        await new Promise(resolve => setTimeout(resolve, 500));

        // Adicionar à lista (mock)
        const novoAnexo: Anexo = {
          id: Math.random().toString(36).substr(2, 9),
          nome: file.name,
          tipo: file.type,
          tamanho: file.size,
          dataUpload: new Date().toISOString().split('T')[0],
          categoria: 'outro'
        };

        setAnexos(prev => [novoAnexo, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload dos arquivos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDownload = async (anexo: Anexo) => {
    try {
      // TODO: Download real do backend
      // const blob = await window.api.clients.downloadAttachment(anexo.id);
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = anexo.nome;
      // a.click();
      // window.URL.revokeObjectURL(url);

      console.log('Download:', anexo.nome);
      alert('Funcionalidade de download em desenvolvimento');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao fazer download do arquivo');
    }
  };

  const handleDelete = async (anexoId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este anexo?')) {
      return;
    }

    try {
      // TODO: Delete real do backend
      // await window.api.clients.deleteAttachment(anexoId);

      setAnexos(prev => prev.filter(a => a.id !== anexoId));
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir o arquivo');
    }
  };

  const anexosFiltrados = filtroCategoria === 'todos'
    ? anexos
    : anexos.filter(a => a.categoria === filtroCategoria);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Anexos e Documentos</h2>
            <p className="text-sm opacity-70">Gerencie documentos e arquivos do cliente</p>
          </div>
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className="px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary text-sm hover:bg-primary/20 transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Enviando...' : 'Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className={`p-4 rounded-full mb-4 transition ${
            dragActive ? 'bg-primary/20' : 'bg-muted'
          }`}>
            <Upload className={`w-8 h-8 ${dragActive ? 'text-primary' : 'opacity-30'}`} />
          </div>
          <p className="font-medium mb-1">
            {dragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos para fazer upload'}
          </p>
          <p className="text-sm opacity-70 mb-4">
            ou clique no botão acima para selecionar
          </p>
          <p className="text-xs opacity-50">
            Formatos aceitos: PDF, PNG, JPG, DOCX (máx. 10MB)
          </p>
        </div>
      </div>

      {/* Filtros por Categoria */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm opacity-70">Filtrar por:</span>
        {(['todos', 'fiscal', 'contrato', 'comprovante', 'outro'] as CategoriaFilter[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtroCategoria === cat
                ? 'bg-primary text-white'
                : 'bg-muted hover:bg-muted/70'
            }`}
          >
            {cat === 'todos' ? 'Todos' : getCategoriaLabel(cat as Anexo['categoria'])}
          </button>
        ))}
      </div>

      {/* Lista de Anexos em Grid */}
      {anexosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anexosFiltrados.map((anexo) => (
            <div
              key={anexo.id}
              className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                  {getFileIcon(anexo.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={anexo.nome}>
                    {anexo.nome}
                  </p>
                  <p className="text-xs opacity-70 mt-0.5">
                    {formatFileSize(anexo.tamanho)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="badge badge-info">
                  {getCategoriaLabel(anexo.categoria)}
                </span>
                <span className="opacity-70">
                  {new Date(anexo.dataUpload).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => handleDownload(anexo)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 text-xs font-medium transition inline-flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Baixar
                </button>
                <button
                  onClick={() => handleDelete(anexo.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-medium transition inline-flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Paperclip className="w-12 h-12 opacity-30 mx-auto mb-4" />
          <p className="text-sm opacity-70 mb-4">
            {filtroCategoria === 'todos'
              ? 'Nenhum anexo cadastrado'
              : `Nenhum anexo na categoria "${getCategoriaLabel(filtroCategoria as Anexo['categoria'])}"`
            }
          </p>
          <button
            type="button"
            onClick={handleUploadClick}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition"
          >
            Adicionar primeiro anexo
          </button>
        </div>
      )}
    </div>
  );
}
