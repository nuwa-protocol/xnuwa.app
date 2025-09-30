import { ChevronsUpDown as ChevronsUpDownIcon } from 'lucide-react';
import { useId, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui';
import { SUPPORTED_PROVIDERS } from '@/shared/constants/cap';
import { cn } from '@/shared/utils';

interface ProviderIdSelectorProps {
  form: UseFormReturn<CapFormData>;
}

export function ProviderIdSelector({ form }: ProviderIdSelectorProps) {
  const fieldId = useId();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="core.model.providerId"
      render={({ field }) => {
        const selectedProvider = field.value
          ? SUPPORTED_PROVIDERS[field.value as keyof typeof SUPPORTED_PROVIDERS]
          : undefined;

        const placeholder = 'Select a provider';
        const items = Object.entries(SUPPORTED_PROVIDERS);

        return (
          <FormItem>
            <FormLabel>Provider ID</FormLabel>
            <Popover open={open} onOpenChange={setOpen} modal={false}>
              <PopoverTrigger asChild>
                {/* Ensure accessibility by attaching id/aria via FormControl */}
                <FormControl>
                  <Button
                    id={fieldId}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      'w-full justify-between',
                      !selectedProvider && 'text-muted-foreground',
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {selectedProvider ? (
                        <>
                          <img
                            src={selectedProvider.icon}
                            alt={selectedProvider.name}
                            className="w-4 h-4 shrink-0"
                          />
                          <span className="truncate">
                            {selectedProvider.name}
                          </span>
                        </>
                      ) : (
                        <span className="truncate">{placeholder}</span>
                      )}
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                      <span className='text-sm text-muted-foreground'> Provider ID:</span>
                      {field.value ? (
                        <Badge variant="outline" className="ml-2">
                          {field.value}
                        </Badge>
                      ) : null}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
                side="bottom"
              >
                <Command>
                  <CommandInput placeholder="Search provider..." />
                  {/* Let the internal list own the scroll area */}
                  <CommandList
                    className="max-h-80"
                    style={{ maxHeight: 'min(20rem, calc(100vh - 8rem))' }}
                    onWheelCapture={(e) => e.stopPropagation()}
                    onTouchMoveCapture={(e) => e.stopPropagation()}
                  >
                    <CommandEmpty>No provider found.</CommandEmpty>
                    <CommandGroup>
                      {items.map(([providerId, provider]) => (
                        <CommandItem
                          key={providerId}
                          value={providerId}
                          onSelect={(val) => {
                            field.onChange(val);
                            setOpen(false);
                          }}
                          className="flex flex-row items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={provider.icon}
                              alt={provider.name}
                              className="w-4 h-4 shrink-0"
                            />
                            <span className="truncate">{provider.name}</span>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {providerId}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormDescription>
              Select the AI provider for your model. Each provider offers
              different models and capabilities.
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
