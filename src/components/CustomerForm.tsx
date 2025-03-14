
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Customer, CustomField } from '@/utils/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { customFieldService } from '@/services/api';
import { toast } from 'sonner';

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  dob: z.date().nullable().optional(),
  phone: z.string().min(5, { message: 'Phone number must be valid' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  occupation: z.string().min(2, { message: 'Occupation must be at least 2 characters' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters' }),
  // Custom fields will be added dynamically
});

// Create a type for the form values
type FormValues = z.infer<typeof formSchema> & {
  customFields?: Record<string, string | number | null>;
};

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer?.name || '',
      dob: customer?.dob || null,
      phone: customer?.phone || '',
      email: customer?.email || '',
      occupation: customer?.occupation || '',
      location: customer?.location || '',
      customFields: {},
    },
  });

  // Load custom fields on mount
  useEffect(() => {
    const loadCustomFields = async () => {
      try {
        setIsLoading(true);
        const fields = await customFieldService.getAll();
        console.log('Loaded custom fields for form:', fields);
        
        // Filter out invalid fields
        const validFields = fields.filter(field => 
          field && 
          typeof field === 'object' && 
          field.id && 
          field.name && 
          field.type
        );
        
        setCustomFields(validFields);
        
        // If editing an existing customer, set custom field values
        if (customer?.customFields?.length) {
          const customFieldValues: Record<string, string | number | null> = {};
          
          customer.customFields.forEach(field => {
            if (field && field.id) {
              customFieldValues[field.id] = field.value as string | number | null;
            }
          });
          
          form.setValue('customFields', customFieldValues);
        }
      } catch (error) {
        console.error('Error loading custom fields for form:', error);
        toast.error('Failed to load custom fields');
        setCustomFields([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCustomFields();
  }, [customer, form]);

  // Handle form submission
  const handleFormSubmit = (data: FormValues) => {
    // Process custom fields before sending data
    const processedCustomFields = customFields
      .filter(field => field && field.id)
      .map(field => {
        return {
          id: field.id.toString(), // Ensure id is a string for consistency
          name: field.name,
          type: field.type,
          value: data.customFields?.[field.id] || null,
        };
      });
    
    const formData = {
      ...data,
      customFields: processedCustomFields,
    };
    
    console.log('Submitting form data:', formData);
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco, CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Custom Fields */}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : customFields.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-medium">Additional Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {customFields.map((field) => (
                <FormItem key={field.id}>
                  <FormLabel>{field.name}</FormLabel>
                  <FormControl>
                    {field.type === 'text' ? (
                      <Input
                        placeholder={field.name}
                        value={form.watch(`customFields.${field.id}`) as string || ''}
                        onChange={(e) => {
                          form.setValue(`customFields.${field.id}`, e.target.value);
                        }}
                      />
                    ) : field.type === 'number' ? (
                      <Input
                        type="number"
                        placeholder={field.name}
                        value={form.watch(`customFields.${field.id}`) as string || ''}
                        onChange={(e) => {
                          form.setValue(`customFields.${field.id}`, e.target.valueAsNumber || null);
                        }}
                      />
                    ) : field.type === 'select' && field.options ? (
                      <Select
                        onValueChange={(value) => form.setValue(`customFields.${field.id}`, value)}
                        defaultValue={form.watch(`customFields.${field.id}`) as string || ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'date' ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !form.watch(`customFields.${field.id}`) && "text-muted-foreground"
                            )}
                          >
                            {form.watch(`customFields.${field.id}`) ? (
                              format(new Date(form.watch(`customFields.${field.id}`) as string), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.watch(`customFields.${field.id}`) ? new Date(form.watch(`customFields.${field.id}`) as string) : undefined}
                            onSelect={(date) => form.setValue(`customFields.${field.id}`, date ? date.toISOString() : null)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Input
                        placeholder={field.name}
                        value={form.watch(`customFields.${field.id}`) as string || ''}
                        onChange={(e) => {
                          form.setValue(`customFields.${field.id}`, e.target.value);
                        }}
                      />
                    )}
                  </FormControl>
                </FormItem>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {customer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
