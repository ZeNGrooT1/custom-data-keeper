
import { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Phone, Mail, MapPin, Briefcase, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/utils/data';
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

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (id: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    const index = parseInt(id.substring(id.length - 2), 36) % colors.length;
    return colors[index];
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-md animate-scale-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex h-10 w-10 rounded-full items-center justify-center text-white ${getRandomColor(customer.id)}`}>
              {getInitials(customer.name)}
            </div>
            <CardTitle className="text-lg font-medium">{customer.name}</CardTitle>
          </div>
          <div className="flex space-x-1 opacity-0 transition-opacity duration-200" style={{ opacity: isHovered ? 1 : 0 }}>
            <Button variant="ghost" size="icon" onClick={() => onEdit(customer)} className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
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
                    This will permanently delete {customer.name}'s record and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(customer.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 p-4">
        <div className="grid grid-cols-1 gap-2">
          {customer.dob && (
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{format(customer.dob, 'PP')}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{customer.occupation}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{customer.location}</span>
          </div>
        </div>
      </CardContent>
      {customer.customFields.length > 0 && (
        <CardFooter className="border-t bg-muted/50 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {customer.customFields.map(field => (
              <Badge key={field.id} variant="outline" className="text-xs">
                {field.name}: {field.value || 'N/A'}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
