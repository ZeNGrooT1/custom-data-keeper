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
import { Briefcase, Users, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showFieldsManager, setShowFieldsManager] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const { data: customers = [], isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  });

  const { data: filteredCustomers = [] } = useQuery({
    queryKey: ['customers', 'search', searchQuery],
    queryFn: () => searchQuery ? customerService.search(searchQuery) : customers,
    enabled: !!searchQuery,
  });

  const displayedCustomers = searchQuery ? filteredCustomers : customers;

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCustomerSubmit = (data: any) => {
    if (selectedCustomer) {
      updateCustomerMutation.mutate({ id: selectedCustomer.id, data });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    deleteCustomerMutation.mutate(id);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleCancelForm = () => {
    setShowCustomerForm(false);
    setSelectedCustomer(undefined);
  };

  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewMode(mode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center glass p-8 rounded-xl shadow-lg">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-muted-foreground font-medium">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center glass p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-red-600 mb-3">Error loading customers</h2>
          <p className="text-muted-foreground">Please try again later or contact support.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary/90 text-white rounded-md hover:bg-primary transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
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
      
      <main className="flex-1 container py-8 px-4 lg:px-8">
        <div 
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="mr-4 bg-primary/10 p-3 rounded-full">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Customer Directory
              </h1>
              <p className="text-muted-foreground">
                {displayedCustomers.length === customers.length 
                  ? `${customers.length} total customers`
                  : `Showing ${displayedCustomers.length} of ${customers.length} customers`
                }
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => handleViewModeChange('list')}
              className="flex items-center gap-1"
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => handleViewModeChange('grid')}
              className="flex items-center gap-1"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Grid</span>
            </Button>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <div 
            className="bg-white/80 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <CustomerList 
              customers={displayedCustomers} 
              onEdit={handleEditCustomer} 
              onDelete={handleDeleteCustomer} 
            />
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {displayedCustomers.length === 0 ? (
              <div 
                className="col-span-full bg-white/80 dark:bg-gray-800/50 text-center py-12 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              >
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No customers found.</p>
              </div>
            ) : (
              displayedCustomers.map(customer => (
                <div key={customer.id}>
                  <CustomerCard 
                    customer={customer} 
                    onEdit={handleEditCustomer} 
                    onDelete={handleDeleteCustomer} 
                  />
                </div>
              ))
            )}
          </div>
        )}
      </main>
      
      <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <CustomerForm 
            customer={selectedCustomer} 
            onSubmit={handleCustomerSubmit} 
            onCancel={handleCancelForm} 
          />
        </DialogContent>
      </Dialog>
      
      <CustomFieldsManager 
        isOpen={showFieldsManager} 
        onClose={() => {
          setShowFieldsManager(false);
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        }} 
      />
      
      <ExcelExport 
        isOpen={showExport} 
        onClose={() => setShowExport(false)} 
        customers={displayedCustomers.length > 0 ? displayedCustomers : customers} 
      />
    </div>
  );
};

export default Index;
