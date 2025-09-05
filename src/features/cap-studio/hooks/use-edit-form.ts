import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod/v3';
import { LLM_GATEWAY_BASE_URL } from '@/shared/config/llm-gateway';
import { useAuth } from '@/shared/hooks';
import {
  CapCoreSchema,
  CapIDNameSchema,
  CapMetadataSchema,
} from '@/shared/types/cap-new';
import type { LocalCap } from '../types';
import { useLocalCapsHandler } from './use-local-caps-handler';

const CapFormDataSchema = z.object({
  idName: CapIDNameSchema,
  core: CapCoreSchema,
  metadata: CapMetadataSchema,
});

type CapFormData = z.input<typeof CapFormDataSchema>;

interface UseEditFormProps {
  editingCap?: LocalCap;
}

export const useEditForm = ({ editingCap }: UseEditFormProps) => {
  const navigate = useNavigate();
  const { did } = useAuth();
  const { createCap, updateCap } = useLocalCapsHandler();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CapFormData>({
    resolver: zodResolver(CapFormDataSchema),
    mode: 'onChange',
    defaultValues: {
      idName: editingCap?.capData.idName || '',
      metadata: {
        displayName: editingCap?.capData.metadata.displayName || '',
        description: editingCap?.capData.metadata.description || '',
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
          gatewayUrl:
            editingCap?.capData.core.model.gatewayUrl || LLM_GATEWAY_BASE_URL,
          modelId: editingCap?.capData.core.model.modelId || '',
          parameters: editingCap?.capData.core.model.parameters || {},
          supportedInputs: editingCap?.capData.core.model.supportedInputs || [
            'text',
          ],
          modelType:
            editingCap?.capData.core.model.modelType ?? 'Language Model',
        },
        mcpServers: editingCap?.capData.core.mcpServers || {},
        artifact: editingCap?.capData.core.artifact || undefined,
      },
    },
  });

  const handleUpdateCap = async (editingCap: LocalCap, data: CapFormData) => {
    // Update existing cap
    updateCap(editingCap.id, {
      capData: {
        id: `${did}:${data.idName}`,
        authorDID: did || '',
        ...data,
      },
    });

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
      toast.error('Failed to save cap. Please try again.');
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
