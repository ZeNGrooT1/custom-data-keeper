
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CustomerList } from '@/components/CustomerList';
import { CustomerCard } from '@/components/CustomerCard';
import { CustomerForm } from '@/components/CustomerForm';
import { CustomFieldsManager } from '@/components/CustomFieldsManager';
import { ExcelExport } from '@/components/ExcelExport';
import { Navbar } from '@/components/Navbar';
import { Customer } from '@/utils/data';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/api';

const Index = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showFieldsManager, setShowFieldsManager] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Fetch customers with React Query
  const { data: customers = [], isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  });

  // Fetch filtered customers if search query exists
  const { data: filteredCustomers = [] } = useQuery({
    queryKey: ['customers', 'search', searchQuery],
    queryFn: () => searchQuery ? customerService.search(searchQuery) : customers,
    enabled: !!searchQuery,
  });

  // Use filtered customers if search query exists, otherwise use all customers
  const displayedCustomers = searchQuery ? filteredCustomers : customers;

  // Customer mutations
  const createCustomerMutation = useMutation({
    mutationFn: (newCustomer: any) => customerService.create(newCustomer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer added successfully');
      setShowCustomerForm(false);
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      toast.error('Failed to add customer');
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => customerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
      setShowCustomerForm(false);
      setSelectedCustomer(undefined);
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  });

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle add/edit customer
  const handleCustomerSubmit = (data: any) => {
    if (selectedCustomer) {
      updateCustomerMutation.mutate({ id: selectedCustomer.id, data });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = (id: string) => {
    deleteCustomerMutation.mutate(id);
  };

  // Handle edit customer (open form with customer data)
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(true);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowCustomerForm(false);
    setSelectedCustomer(undefined);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: string) => {
    setViewMode(mode as 'list' | 'grid');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading customers</h2>
          <p className="text-muted-foreground">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar 
        onSearch={handleSearch}
        onAddCustomer={() => {
          setSelectedCustomer(undefined);
          setShowCustomerForm(true);
        }}
        onManageFields={() => setShowFieldsManager(true)}
        onExport={() => setShowExport(true)}
        activeTab={viewMode}
        onTabChange={handleViewModeChange}
      />
      
      <main className="flex-1 container py-6 px-4 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-2">Customer Management</h1>
          <p className="text-muted-foreground">
            {displayedCustomers.length === customers.length 
              ? `Manage all your ${customers.length} customers`
              : `Showing ${displayedCustomers.length} of ${customers.length} customers`
            }
          </p>
        </div>
        
        {viewMode === 'list' ? (
          <CustomerList 
            customers={displayedCustomers} 
            onEdit={handleEditCustomer} 
            onDelete={handleDeleteCustomer} 
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedCustomers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No customers found.</p>
              </div>
            ) : (
              displayedCustomers.map(customer => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer} 
                  onEdit={handleEditCustomer} 
                  onDelete={handleDeleteCustomer} 
                />
              ))
            )}
          </div>
        )}
      </main>
      
      {/* Customer Form Dialog */}
      <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <CustomerForm 
            customer={selectedCustomer} 
            onSubmit={handleCustomerSubmit} 
            onCancel={handleCancelForm} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Custom Fields Manager */}
      <CustomFieldsManager 
        isOpen={showFieldsManager} 
        onClose={() => {
          setShowFieldsManager(false);
          // Refresh customer list to reflect potential field changes
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        }} 
      />
      
      {/* Excel Export Dialog */}
      <ExcelExport 
        isOpen={showExport} 
        onClose={() => setShowExport(false)} 
        customers={displayedCustomers.length > 0 ? displayedCustomers : customers} 
      />
    </div>
  );
};

export default Index;
