import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui';
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from '@/shared/components/ui/shadcn-io/tags';

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
              <Tags value={field.value?.join(', ') || ''} setValue={field.onChange}>
                <TagsTrigger>
                  {field.value && field.value.length > 0
                    ? field.value.map((tag) => (
                      <TagsValue key={tag} onRemove={() => handleRemoveInput(tag,
                        currentInputs,
                        field.onChange)}>
                        {tag}
                      </TagsValue>
                    ))
                    : null}
                </TagsTrigger>
                <TagsContent>
                  <TagsInput placeholder="Add input type..." />
                  <TagsList>
                    <TagsEmpty>No tags found.</TagsEmpty>
                    <TagsGroup>
                      {inputTypes.map((tag) => (
                        <TagsItem key={tag.value} onSelect={() => handleAddInput(tag.value,
                          currentInputs,
                          field.onChange)}>
                          {tag.label}
                        </TagsItem>
                      ))}
                    </TagsGroup>
                  </TagsList>
                </TagsContent>
              </Tags>

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
