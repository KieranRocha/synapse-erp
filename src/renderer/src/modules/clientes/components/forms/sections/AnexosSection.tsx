import React, { useState, useRef } from 'react';
import { Upload, Trash2, FileText, Image as ImageIcon, File, Paperclip } from 'lucide-react';
import { Section } from '../../../../../shared/components/ui';

interface AnexosSectionProps {
  onAnexosChange?: (anexos: File[]) => void;
}

interface AnexoPreview {
  id: string;
  file: File;
  categoria: 'fiscal' | 'contrato' | 'comprovante' | 'outro';
}

type CategoriaFilter = 'todos' | 'fiscal' | 'contrato' | 'comprovante' | 'outro';

export function AnexosSection({ onAnexosChange }: AnexosSectionProps) {
  const [anexos, setAnexos] = useState<AnexoPreview[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaFilter>('todos');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getCategoriaLabel = (categoria: AnexoPreview['categoria']) => {
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
      const novosAnexos: AnexoPreview[] = [];

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

        const novoAnexo: AnexoPreview = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          categoria: 'outro'
        };

        novosAnexos.push(novoAnexo);
      }

      setAnexos(prev => {
        const updated = [...novosAnexos, ...prev];
        onAnexosChange?.(updated.map(a => a.file));
        return updated;
      });
    } catch (error) {
      console.error('Erro ao adicionar arquivos:', error);
      alert('Erro ao adicionar arquivos');
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

  const handleDelete = (anexoId: string) => {
    setAnexos(prev => {
      const updated = prev.filter(a => a.id !== anexoId);
      onAnexosChange?.(updated.map(a => a.file));
      return updated;
    });
  };

  const handleCategoriaChange = (anexoId: string, categoria: AnexoPreview['categoria']) => {
    setAnexos(prev => prev.map(a => a.id === anexoId ? { ...a, categoria } : a));
  };

  const anexosFiltrados = filtroCategoria === 'todos'
    ? anexos
    : anexos.filter(a => a.categoria === filtroCategoria);

  return (

    <Section
      title="Anexos e Documentos"
      subtitle="Adicione documentos e arquivos do cliente"
      icon={<Paperclip className="w-5 h-5" />}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.docx"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Zone */}
      <div
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl cursor-pointer p-8 text-center transition ${dragActive
          ? 'border-primary bg-primary/5'
          : 'border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30'
          }`}
      >
        <div className="flex flex-col items-center">
          <div className={`p-3 rounded-full mb-3 transition ${dragActive ? 'bg-primary/20' : 'bg-muted'
            }`}>
            <Upload className={`w-6 h-6 ${dragActive ? 'text-primary' : 'opacity-30'}`} />
          </div>
          <p className="font-medium mb-1 text-sm">
            {dragActive ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos para fazer upload'}
          </p>
          <p className="text-xs opacity-70 mb-3">
            Clique na área ou arraste arquivos
          </p>
          <p className="text-xs opacity-50">
            Formatos aceitos: PDF, PNG, JPG, DOCX (máx. 10MB)
          </p>
        </div>
      </div>

      {anexos.length > 0 && (
        <>
          {/* Filtros por Categoria */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm opacity-70">Filtrar:</span>
            {(['todos', 'fiscal', 'contrato', 'comprovante', 'outro'] as CategoriaFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filtroCategoria === cat
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/70'
                  }`}
              >
                {cat === 'todos' ? 'Todos' : getCategoriaLabel(cat as AnexoPreview['categoria'])}
              </button>
            ))}
          </div>

          {/* Lista de Anexos */}
          {anexosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anexosFiltrados.map((anexo) => (
                <div
                  key={anexo.id}
                  className="bg-muted/30 border border-border rounded-xl p-3 hover:shadow-sm transition"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-bg flex-shrink-0">
                      {getFileIcon(anexo.file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" title={anexo.file.name}>
                        {anexo.file.name}
                      </p>
                      <p className="text-xs opacity-70 mt-0.5">
                        {formatFileSize(anexo.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-xs opacity-70 mb-1 block">Categoria:</label>
                    <select
                      value={anexo.categoria}
                      onChange={(e) => handleCategoriaChange(anexo.id, e.target.value as AnexoPreview['categoria'])}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="fiscal">Fiscal</option>
                      <option value="contrato">Contrato</option>
                      <option value="comprovante">Comprovante</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(anexo.id)}
                    className="w-full px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-medium transition inline-flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remover
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm opacity-70">
              Nenhum anexo na categoria "{getCategoriaLabel(filtroCategoria as AnexoPreview['categoria'])}"
            </div>
          )}
        </>
      )}

    </Section>



  );
}
