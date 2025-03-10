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
import { motion } from 'framer-motion';
import { Briefcase, Users, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
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
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
          
          <div className="hidden sm:flex items-center gap-2">
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
        </motion.div>
        
        {viewMode === 'list' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <CustomerList 
              customers={displayedCustomers} 
              onEdit={handleEditCustomer} 
              onDelete={handleDeleteCustomer} 
            />
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {displayedCustomers.length === 0 ? (
              <motion.div 
                variants={itemVariants}
                className="col-span-full bg-white/80 dark:bg-gray-800/50 text-center py-12 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              >
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No customers found.</p>
              </motion.div>
            ) : (
              displayedCustomers.map(customer => (
                <motion.div key={customer.id} variants={itemVariants}>
                  <CustomerCard 
                    customer={customer} 
                    onEdit={handleEditCustomer} 
                    onDelete={handleDeleteCustomer} 
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </main>
      
      {/* Customer Form Dialog */}
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
