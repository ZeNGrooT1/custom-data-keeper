
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { customFieldService } from '@/services/api';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Field name must be at least 2 characters' }),
  type: z.enum(['text', 'number', 'date', 'select'], { 
    errorMap: () => ({ message: 'Please select a field type' }) 
  }),
  options: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomField {
  id: string;
  name: string;
  type: string;
  options: string[] | null;
}

interface CustomFieldsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomFieldsManager({ isOpen, onClose }: CustomFieldsManagerProps) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [showAddField, setShowAddField] = useState(false);

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
      const loadFields = async () => {
        try {
          const fields = await customFieldService.getAll();
          // Filter out any fields that don't have the required properties
          const validFields = fields.filter(field => 
            field && 
            typeof field === 'object' && 
            field.id && 
            field.name && 
            field.type
          );
          setFields(validFields);
        } catch (error) {
          console.error('Error loading custom fields:', error);
          setFields([]);
        }
      };
      
      loadFields();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!showAddField) {
      form.reset();
    }
  }, [showAddField, form]);

  const handleFormSubmit = async (data: FormValues) => {
    try {
      const options = data.type === 'select' && data.options
        ? data.options.split(',').map(opt => opt.trim())
        : null;
      
      const newField = await customFieldService.create({
        name: data.name,
        type: data.type,
        options,
      });
      
      setFields([...fields, newField]);
      setShowAddField(false);
      form.reset();
    } catch (error) {
      console.error('Error adding custom field:', error);
    }
  };

  const handleDeleteField = async (id: string) => {
    try {
      await customFieldService.delete(id);
      setFields(fields.filter(field => field.id !== id));
    } catch (error) {
      console.error('Error deleting custom field:', error);
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
            <Button onClick={() => setShowAddField(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>
          
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
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </div>
        
        <Dialog open={showAddField} onOpenChange={setShowAddField}>
          <DialogContent className="animate-slide-in">
            <DialogHeader>
              <DialogTitle>Add Custom Field</DialogTitle>
              <DialogDescription>
                Create a new custom field for your customer records.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Company Size" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="select">Select (Dropdown)</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <FormLabel>Options</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Option 1, Option 2, Option 3" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddField(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Field</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
