
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Customer, CustomField, generateExcelData } from '@/utils/data';
import { useToast } from '@/hooks/use-toast';
import { customFieldService } from '@/services/api';

interface ExcelExportProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
}

export function ExcelExport({ isOpen, onClose, customers }: ExcelExportProps) {
  const [fileName, setFileName] = useState('customers_export');
  const [exportAll, setExportAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const fields = await customFieldService.getAll();
        setCustomFields(fields);
      } catch (error) {
        console.error('Error loading custom fields for export:', error);
        toast({
          title: 'Warning',
          description: 'Could not load all custom fields. Export may be incomplete.',
          variant: 'destructive',
        });
      }
    };

    if (isOpen) {
      fetchCustomFields();
    }
  }, [isOpen, toast]);

  const handleExport = async () => {
    try {
      setLoading(true);

      // Generate Excel data from the customers including custom fields
      const data = generateExcelData(customers, customFields);
      
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values with commas by wrapping in quotes
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');
      
      // Create a Blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link and trigger it
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Successful',
        description: `${customers.length} customers exported to ${fileName}.csv`,
      });
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle>Export Customer Data</DialogTitle>
          <DialogDescription>
            Export your customer data to a CSV file for further analysis.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="customers_export"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="export-all"
              checked={exportAll}
              onCheckedChange={(checked) => setExportAll(checked as boolean)}
            />
            <Label htmlFor="export-all">Export all {customers.length} customers</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <span className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
