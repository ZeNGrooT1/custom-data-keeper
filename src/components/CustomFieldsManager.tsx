import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import customFieldService from '../services/customFieldService';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Import CustomField type
import type { CustomField } from '../types';

// Form schema
interface CustomField {
  id: string;
  name: string;
  type: string;
  options?: string[];
}

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Field name must be at least 2 characters.' }),
  type: z.string(),
  options: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomFieldsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomFieldsManager({ isOpen, onClose }: CustomFieldsManagerProps) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'text',
      options: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadFields();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!showAddField) {
      form.reset();
    }
  }, [showAddField, form]);

  const loadFields = async () => {
    try {
      setIsLoading(true);
      const fetchedFields = await customFieldService.getAll();
      console.log('Fetched custom fields:', fetchedFields);

      // Ensure we only use fields with valid data
      const validFields = fetchedFields.filter(field => 
        field && 
        typeof field === 'object' && 
        field.id && 
        field.name && 
        field.type
      );

      setFields(validFields);
    } catch (error) {
      console.error('Error loading custom fields:', error);
      toast.error('Failed to load custom fields');
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      setIsLoading(true);
      await customFieldService.deleteField(fieldId);
      toast.success('Custom field deleted successfully');
      setFields(fields.filter(field => field.id !== fieldId));
    } catch (error) {
      console.error('Error deleting custom field:', error);
      toast.error('Failed to delete custom field');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      // Parse options for select type fields
      let parsedOptions = null;
      if (data.type === 'select' && data.options) {
        parsedOptions = data.options.split(',').map(opt => opt.trim()).filter(opt => opt);
      }

      const newField = await customFieldService.createField({
        name: data.name,
        type: data.type,
        options: parsedOptions
      });

      toast.success('Custom field created successfully');
      setFields([...fields, newField]);
      setShowAddField(false);
      form.reset();
    } catch (error) {
      console.error('Error creating custom field:', error);
      toast.error('Failed to create custom field');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Custom Fields</DialogTitle>
          <DialogDescription>
            Add, edit, or remove custom fields for customer records.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Current Fields</h3>
            <Button onClick={() => setShowAddField(true)} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>

          {isLoading && fields.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No custom fields defined yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">{field.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{field.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {field.type === 'select' && field.options ? (
                            <div className="flex flex-wrap gap-1">
                              {field.options.map((option, index) => (
                                <Badge key={`${option}-${index}`} variant="secondary" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the "{field.name}" field from all customer records.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteField(field.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <Dialog open={showAddField} onOpenChange={setShowAddField}>
          <DialogContent className="animate-slide-in">
            <DialogHeader>
              <DialogTitle>Add Custom Field</DialogTitle>
              <DialogDescription>
                Create a new custom field for customer profiles.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Company Size" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a field type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the type of data this field will store.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('type') === 'select' && (
                  <FormField
                    control={form.control}
                    name="options"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dropdown Options</FormLabel>
                        <FormControl>
                          <Input placeholder="Option 1, Option 2, Option 3" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter options separated by commas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddField(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Field'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}