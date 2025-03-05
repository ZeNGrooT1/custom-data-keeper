
import { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Customer } from '@/utils/data';
import { Button } from '@/components/ui/button';
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

type SortField = 'name' | 'dob' | 'email' | 'phone' | 'occupation' | 'location';
type SortDirection = 'asc' | 'desc';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomerList({ customers, onEdit, onDelete }: CustomerListProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * direction;
      case 'email':
        return a.email.localeCompare(b.email) * direction;
      case 'phone':
        return a.phone.localeCompare(b.phone) * direction;
      case 'occupation':
        return a.occupation.localeCompare(b.occupation) * direction;
      case 'location':
        return a.location.localeCompare(b.location) * direction;
      case 'dob':
        if (!a.dob) return direction;
        if (!b.dob) return -direction;
        return (a.dob.getTime() - b.dob.getTime()) * direction;
      default:
        return 0;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div className="w-full overflow-auto rounded-md border animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Name
                <SortIcon field="name" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('dob')}
            >
              <div className="flex items-center">
                Date of Birth
                <SortIcon field="dob" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('phone')}
            >
              <div className="flex items-center">
                Phone
                <SortIcon field="phone" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('email')}
            >
              <div className="flex items-center">
                Email
                <SortIcon field="email" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('occupation')}
            >
              <div className="flex items-center">
                Occupation
                <SortIcon field="occupation" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('location')}
            >
              <div className="flex items-center">
                Location
                <SortIcon field="location" />
              </div>
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            sortedCustomers.map((customer) => (
              <TableRow key={customer.id} className="group animate-slide-in">
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.dob ? format(customer.dob, 'PP') : 'N/A'}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell className="max-w-[200px] truncate">{customer.email}</TableCell>
                <TableCell>{customer.occupation}</TableCell>
                <TableCell>{customer.location}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
