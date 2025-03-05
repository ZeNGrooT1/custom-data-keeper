
import { useState, useEffect } from 'react';
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
import { 
  Customer, 
  getCustomers, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer, 
  searchCustomers 
} from '@/utils/data';

const Index = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showFieldsManager, setShowFieldsManager] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Load customers on mount
  useEffect(() => {
    const loadedCustomers = getCustomers();
    setCustomers(loadedCustomers);
    setFilteredCustomers(loadedCustomers);
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const results = searchCustomers(query);
      setFilteredCustomers(results);
    }
  };

  // Handle add/edit customer
  const handleCustomerSubmit = (data: any) => {
    let updatedCustomers;
    
    if (selectedCustomer) {
      // Update existing customer
      const updated = updateCustomer(selectedCustomer.id, data);
      updatedCustomers = customers.map(c => c.id === selectedCustomer.id ? updated! : c);
      toast.success('Customer updated successfully');
    } else {
      // Add new customer
      const newCustomer = addCustomer(data);
      updatedCustomers = [newCustomer, ...customers];
      toast.success('Customer added successfully');
    }
    
    setCustomers(updatedCustomers);
    setFilteredCustomers(searchQuery ? searchCustomers(searchQuery) : updatedCustomers);
    setShowCustomerForm(false);
    setSelectedCustomer(undefined);
  };

  // Handle delete customer
  const handleDeleteCustomer = (id: string) => {
    const success = deleteCustomer(id);
    
    if (success) {
      const updatedCustomers = customers.filter(c => c.id !== id);
      setCustomers(updatedCustomers);
      setFilteredCustomers(searchQuery ? searchCustomers(searchQuery) : updatedCustomers);
      toast.success('Customer deleted successfully');
    } else {
      toast.error('Failed to delete customer');
    }
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
            {filteredCustomers.length === customers.length 
              ? `Manage all your ${customers.length} customers`
              : `Showing ${filteredCustomers.length} of ${customers.length} customers`
            }
          </p>
        </div>
        
        {viewMode === 'list' ? (
          <CustomerList 
            customers={filteredCustomers} 
            onEdit={handleEditCustomer} 
            onDelete={handleDeleteCustomer} 
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No customers found.</p>
              </div>
            ) : (
              filteredCustomers.map(customer => (
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
          setFilteredCustomers(searchQuery ? searchCustomers(searchQuery) : getCustomers());
        }} 
      />
      
      {/* Excel Export Dialog */}
      <ExcelExport 
        isOpen={showExport} 
        onClose={() => setShowExport(false)} 
        customers={filteredCustomers.length > 0 ? filteredCustomers : customers} 
      />
    </div>
  );
};

export default Index;
