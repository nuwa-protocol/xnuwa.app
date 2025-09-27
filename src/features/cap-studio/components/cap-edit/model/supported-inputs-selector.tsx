import { X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import {
  Badge,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';

interface SupportedInputsSelectorProps {
  form: UseFormReturn<CapFormData>;
}

export function SupportedInputsSelector({
  form,
}: SupportedInputsSelectorProps) {
  const inputTypes = [
    { value: 'text' as const, label: 'Text (Required)', required: true },
    { value: 'image' as const, label: 'Image', required: false },
    { value: 'file' as const, label: 'File', required: false },
    { value: 'audio' as const, label: 'Audio', required: false },
  ];

  const handleRemoveInput = (
    inputToRemove: string,
    currentInputs: ('text' | 'image' | 'file' | 'audio')[],
    onChange: (value: ('text' | 'image' | 'file' | 'audio')[]) => void,
  ) => {
    if (inputToRemove === 'text') return; // Text is required and cannot be removed
    const newInputs = currentInputs.filter((input) => input !== inputToRemove);
    onChange(newInputs);
  };

  const handleAddInput = (
    newInput: string,
    currentInputs: ('text' | 'image' | 'file' | 'audio')[],
    onChange: (value: ('text' | 'image' | 'file' | 'audio')[]) => void,
  ) => {
    if (
      !currentInputs.includes(newInput as 'text' | 'image' | 'file' | 'audio')
    ) {
      onChange([
        ...currentInputs,
        newInput as 'text' | 'image' | 'file' | 'audio',
      ]);
    }
  };

  return (
    <FormField
      control={form.control}
      name="core.model.supportedInputs"
      render={({ field }) => {
        const currentInputs = field.value || ['text'];
        const availableInputs = inputTypes.filter(
          (type) => !currentInputs.includes(type.value),
        );

        return (
          <FormItem>
            <FormLabel>Supported Inputs</FormLabel>
            <FormControl>
              <div className="space-y-3">
                {/* Selected inputs as badges */}
                <div className="flex flex-wrap gap-2">
                  {currentInputs.map((input) => {
                    const inputType = inputTypes.find(
                      (type) => type.value === input,
                    );
                    return (
                      <Badge
                        key={input}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {inputType?.label || input}
                        {input !== 'text' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveInput(
                                input,
                                currentInputs,
                                field.onChange,
                              )
                            }
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </Badge>
                    );
                  })}
                </div>

                {/* Add new input selector */}
                {availableInputs.length > 0 && (
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value) {
                        handleAddInput(value, currentInputs, field.onChange);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add input type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInputs.map((inputType) => (
                        <SelectItem
                          key={inputType.value}
                          value={inputType.value}
                        >
                          {inputType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Select the input types your model supports (text is required)
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
