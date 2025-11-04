import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod/v3';
import { useAuth } from '@/shared/hooks';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import {
  CapCoreSchema,
  CapIDNameSchema,
  CapMetadataSchema,
} from '@/shared/types';
import { CapStudioStore } from '../stores';
import type { LocalCap } from '../types';

const CapFormDataSchema = z.object({
  idName: CapIDNameSchema,
  core: CapCoreSchema,
  metadata: CapMetadataSchema,
});

export type CapFormData = z.input<typeof CapFormDataSchema>;

interface UseEditFormProps {
  editingCap?: LocalCap;
}

export const useEditForm = ({ editingCap }: UseEditFormProps) => {
  const navigate = useNavigate();
  const { did } = useAuth();
  const { createCap, updateCap } = CapStudioStore();
  const { currentCap, setCurrentCap } = CurrentCapStore();
  const [isSaving, setIsSaving] = useState(false);

  const form: UseFormReturn<CapFormData> = useForm<CapFormData>({
    resolver: zodResolver(CapFormDataSchema),
    mode: 'onChange',
    defaultValues: {
      idName: editingCap?.capData.idName || '',
      metadata: {
        displayName: editingCap?.capData.metadata.displayName || '',
        description: editingCap?.capData.metadata.description || '',
        introduction: editingCap?.capData.metadata.introduction || '',
        tags: editingCap?.capData.metadata.tags || [],
        thumbnail: editingCap?.capData.metadata.thumbnail || undefined,
        homepage: editingCap?.capData.metadata.homepage || undefined,
        repository: editingCap?.capData.metadata.repository || undefined,
      },
      core: {
        prompt: {
          value: editingCap?.capData.core.prompt.value || '',
          suggestions: editingCap?.capData.core.prompt.suggestions || [],
        },
        model: {
          customGatewayUrl:
            editingCap?.capData.core.model.customGatewayUrl || undefined,
          providerId: editingCap?.capData.core.model.providerId || 'openrouter',
          modelId: editingCap?.capData.core.model.modelId || '',
          contextLength: editingCap?.capData.core.model.contextLength || 0,
          supportedInputs: editingCap?.capData.core.model.supportedInputs || [
            'text',
          ],
          parameters: editingCap?.capData.core.model.parameters || {},
        },
        mcpServers: editingCap?.capData.core.mcpServers || {},
        artifact: editingCap?.capData.core.artifact || undefined,
      },
    },
  });

  const handleUpdateCap = async (editingCap: LocalCap, data: CapFormData) => {
    // Build the latest capData payload once to avoid fetching back from the store
    const newCapData = {
      id: `${did}:${data.idName}`,
      authorDID: did || '',
      ...data,
    };

    // Update existing cap in Cap Studio store
    updateCap(editingCap.id, {
      capData: newCapData,
    });

    // If the currently active cap is this local cap, also update the current cap store
    // Otherwise the app could keep using stale cap data
    const isEditingCurrentLocalCap =
      currentCap && 'capData' in currentCap && currentCap.id === editingCap.id;
    if (isEditingCurrentLocalCap) {
      // Directly set the updated local cap instance to keep CurrentCapStore in sync
      setCurrentCap({
        ...editingCap,
        capData: newCapData,
        updatedAt: Date.now(),
      });
    }

    toast.success(`${data.metadata.displayName} has been updated successfully`);

    navigate('/cap-studio');
  };

  const handleCreateCap = async (data: CapFormData) => {
    // Create new cap
    createCap({
      id: `${did}:${data.idName}`,
      authorDID: did || '',
      ...data,
    });

    toast.success(`${data.metadata.displayName} has been created successfully`);

    navigate('/cap-studio');
  };

  const handleFormSave = async (data: CapFormData) => {
    try {
      // Trigger validation for all fields
      const isValid = await form.trigger();

      if (!isValid) {
        toast.warning('Please fix all validation errors before saving');
        return;
      }

      setIsSaving(true);

      if (editingCap) {
        // Update existing cap
        handleUpdateCap(editingCap, data);
      } else {
        handleCreateCap(data);
      }
    } catch (error) {
      toast.error('Failed to save agent. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormCancel = () => {
    navigate('/cap-studio');
  };

  return {
    form,
    handleFormSave,
    handleFormCancel,
    isSaving,
  };
};
