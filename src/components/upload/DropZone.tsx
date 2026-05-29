'use client'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onFile: (file: File) => void
  isLoading?: boolean
}

export function DropZone({ onFile, isLoading }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) onFile(accepted[0])
    },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-slate-300 hover:border-primary hover:bg-slate-50',
        isLoading && 'pointer-events-none opacity-60',
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isDragActive ? (
          <Upload className="h-10 w-10 text-primary" />
        ) : (
          <FileSpreadsheet className="h-10 w-10 text-slate-400" />
        )}
        <div>
          <p className="text-sm font-medium text-slate-700">
            {isDragActive ? 'Drop the file here' : 'Drag & drop your KPI workbook'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            .xlsx files only — Monthly KPI Report
          </p>
        </div>
        {!isDragActive && (
          <span className="text-xs text-primary font-medium">Browse files</span>
        )}
      </div>
    </div>
  )
}
