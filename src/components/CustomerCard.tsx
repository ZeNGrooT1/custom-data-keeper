
import React from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, User, Calendar, Phone, Mail, Briefcase, MapPin } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Customer } from '@/utils/data';
import { Badge } from '@/components/ui/badge';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  // Function to format custom field values
  const formatCustomFieldValue = (value: string | number | Date | null): string => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return format(value, 'PP');
    return String(value);
  };

  return (
    <Card className="animate-fadeIn transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-medium">{customer.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                Edit customer
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(customer.id)}
              >
                Delete customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          {customer.dob && (
            <span className="flex items-center text-sm mt-1">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{format(customer.dob, 'PP')}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center">
            <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>{customer.occupation}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>{customer.location}</span>
          </div>
        </div>
      </CardContent>
      {customer.customFields.length > 0 && (
        <CardFooter className="border-t pt-3 pb-3">
          <div className="w-full">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Additional Information</h4>
            <div className="grid gap-2 text-sm">
              {customer.customFields.map((field) => (
                field.value && (
                  <div key={`${customer.id}-${field.id}`} className="flex items-start">
                    <Badge variant="outline" className="mr-2 mt-0.5">
                      {field.name}
                    </Badge>
                    <span>{formatCustomFieldValue(field.value)}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
