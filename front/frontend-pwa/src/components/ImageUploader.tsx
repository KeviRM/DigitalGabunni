// frontend-pwa/src/components/ImageUploader.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { FaUpload, FaTrashAlt, FaTimesCircle } from 'react-icons/fa';

interface ImageUploaderProps {
  currentImageUrl?: string | null; // URL de la imagen actual (si ya existe)
  onFileSelect: (file: File | null) => void; // Callback para enviar el archivo al componente padre
  disabled: boolean;
}

const MAX_SIZE_MB = 5; 
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];  

const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImageUrl, onFileSelect, disabled }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  
  // Limpia el archivo local y el error
  const resetFile = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
    setError(null);
  }, [onFileSelect]);

  // Manejador de Validaciones y Solicitud 
  const handleFile = useCallback((selectedFile: File) => {
    setError(null);

    //Validar Tipo de Archivo
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError("Formato inválido. Solo se aceptan JPG y PNG.");
      resetFile();
      return;
    }

    //  Validar Tamaño Máximo (5 MB)
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo es demasiado grande. Máximo ${MAX_SIZE_MB} MB.`);
      resetFile();
      return;
    }

    // Archivo válido: Guardar y crear URL de previsualización
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    onFileSelect(selectedFile);
    
  }, [onFileSelect, resetFile]);

  //  Manejador de Arrastrar y Soltar (Drop) 
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remover clase de hover visual
    e.currentTarget.classList.remove('border-orange-500', 'bg-orange-50');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  // Manejadores de Drag (para efectos visuales)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('border-orange-500', 'bg-orange-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-orange-500', 'bg-orange-50');
  };

  const isUploading = useMemo(() => file !== null && previewUrl !== currentImageUrl, [file, previewUrl, currentImageUrl]);
  
  // URL final a mostrar: la nueva previsualización o la imagen actual
  const finalPreviewUrl = file ? previewUrl : currentImageUrl;

  return (
    <div className={`border-2 border-dashed rounded-lg p-4 transition-all duration-300 ${disabled ? 'opacity-50 pointer-events-none' : 'border-gray-300'}`}>
      
      {/* Área de Visualización y Drag & Drop */}
      <div 
        className={`relative h-48 flex items-center justify-center text-center cursor-pointer mb-3 rounded-md overflow-hidden transition-colors ${error ? 'border-red-500 border-dashed' : 'border-gray-200'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById('fileInput')?.click()}
      >
        {finalPreviewUrl ? (
          <>
            <img src={finalPreviewUrl} alt="Vista Previa" className="absolute w-full h-full object-cover" />
            {isUploading && <div className='absolute inset-0  flex items-center justify-center text-white font-bold'>¡Nueva Imagen Lista!</div>}
          </>
        ) : (
          <div className='text-gray-500'>
            <FaUpload className="text-4xl mx-auto mb-2" />
            <p>Arrastra y suelta aquí  o haz clic para subir</p>
            <p className="text-xs mt-1">PNG o JPG, máx {MAX_SIZE_MB}MB</p>
          </div>
        )}
      </div>

      {/* Input de Archivo Oculto */}
      <input 
        type="file"
        id="fileInput"
        accept="image/jpeg,image/png"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        className="hidden"
        disabled={disabled}
      />
      
      {/* Mensajes de Error y Botones */}
      {error && (
        <p className="text-red-500 text-sm flex items-center mb-2">
          <FaTimesCircle className='mr-1' /> {error}
        </p>
      )}

      {(file || currentImageUrl) && (
        <button 
          type="button"
          onClick={resetFile} 
          className="w-full py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 flex items-center justify-center"
        >
          <FaTrashAlt className='mr-2' /> {file ? 'Cancelar Subida' : 'Eliminar Imagen Actual'}
        </button>
      )}
    </div>
  );
};

export default ImageUploader;