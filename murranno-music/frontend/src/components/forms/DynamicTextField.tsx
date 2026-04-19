import { Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface DynamicTextFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  maxFields?: number;
  placeholder?: string;
  disabled?: boolean;
}

export const DynamicTextField = ({ 
  label, 
  values, 
  onChange, 
  maxFields = 3,
  placeholder,
  disabled = false
}: DynamicTextFieldProps) => {
  const handleAdd = () => {
    if (values.length < maxFields) {
      onChange([...values, '']);
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="flex-1 p-3 bg-input border border-border rounded-[12px] text-foreground placeholder-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="p-3 bg-secondary/20 hover:bg-secondary/40 border border-border rounded-[12px] transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ))}
      {values.length < maxFields && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          Add {values.length > 0 ? 'another' : ''} {label.toLowerCase()}
        </button>
      )}
    </div>
  );
};
