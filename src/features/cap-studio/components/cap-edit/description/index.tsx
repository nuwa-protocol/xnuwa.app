import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Markdown } from '@/shared/components/markdown';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Textarea,
} from '@/shared/components/ui';

interface DescriptionTabProps {
    form: UseFormReturn<any>;
}

export function DescriptionTab({ form }: DescriptionTabProps) {
    // Local tab state for Write/Preview
    const [tab, setTab] = useState<'write' | 'preview'>('write');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Cap Description</CardTitle>
                <CardDescription>
                    Tell us everything about your cap. Markdown is supported.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="metadata.description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                                    <TabsList>
                                        <TabsTrigger value="write">Write</TabsTrigger>
                                        <TabsTrigger value="preview">Preview</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="write" className="mt-3">
                                        <Textarea
                                            placeholder="Describe what your cap does, usage instructions, examples, limits, and credits. Use Markdown for formatting."
                                            className="min-h-[320px]"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        />
                                    </TabsContent>
                                    <TabsContent value="preview" className="mt-3">
                                        <div className="border-input bg-background text-sm rounded-md border p-4">
                                            {(field.value ?? '').trim().length > 0 ? (
                                                <Markdown className="prose dark:prose-invert max-w-none">
                                                    {field.value}
                                                </Markdown>
                                            ) : (
                                                <p className="text-muted-foreground">Nothing to preview</p>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
