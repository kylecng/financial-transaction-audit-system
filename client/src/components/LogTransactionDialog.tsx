import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons'; // Or your preferred icon library

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
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
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  useTransactionStore,
  LogTransactionData,
} from '@/stores/transactionStore'; // Import store and type

// Define Zod schema for validation
const formSchema = z.object({
  transactionType: z.string().min(1, 'Transaction type is required'),
  amount: z.coerce // Use coerce to convert input string to number
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive'),
  currency: z
    .string()
    .min(1, 'Currency is required')
    .length(3, 'Use 3-letter currency code (e.g., USD)'),
  accountId: z.string().min(1, 'Account ID is required'),
  transactionTimestamp: z.date({
    required_error: 'Transaction date/time is required.',
  }),
  description: z.string().optional(),
  sourceSystem: z.string().optional(),
});

// Define some example options
const transactionTypeOptions = ['Credit', 'Debit', 'Transfer', 'Payment'];
const currencyOptions = ['USD', 'EUR', 'GBP', 'JPY']; // Example currencies

interface LogTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Optional callback on successful submission
}

const LogTransactionDialog: React.FC<LogTransactionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { logTransaction, isLogging, logError, logSuccess, resetLogStatus } =
    useTransactionStore();

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: '',
      amount: undefined,
      currency: '',
      accountId: '',
      transactionTimestamp: undefined,
      description: '',
      sourceSystem: '',
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const transactionData: LogTransactionData = {
      ...values,
      amount: Number(values.amount),
      transactionTimestamp: values.transactionTimestamp.toISOString(),
    };
    console.log('Submitting transaction via dialog:', transactionData);
    const success = await logTransaction(transactionData);
    if (success) {
      form.reset(); // Reset form on success
      onSuccess?.(); // Call the success callback if provided
      // Close the dialog automatically after a short delay to show success message
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    }
  }

  // Reset log status when dialog opens or closes
  useEffect(() => {
    if (open) {
      resetLogStatus(); // Reset status when dialog opens
      // Optionally reset form fields as well if desired
      // form.reset();
    }
    // No need for cleanup on unmount here as the store handles state
  }, [open, resetLogStatus]);

  // Reset form and status if dialog is closed externally
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      resetLogStatus();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Log New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details for the new transaction. Click log when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-auto pr-2">
          {' '}
          {/* Added padding-right for scrollbar */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="log-transaction-form"
              className="space-y-4 py-2"
            >
              {/* Transaction Type */}
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLogging}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transactionTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 100.50"
                        {...field}
                        disabled={isLogging}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? undefined : +e.target.value
                          )
                        }
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLogging}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency (e.g., USD)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Use 3-letter currency code.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Account ID */}
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter account identifier"
                        {...field}
                        disabled={isLogging}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Transaction Timestamp */}
              <FormField
                control={form.control}
                name="transactionTimestamp"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Transaction Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={isLogging}
                          >
                            {field.value ? (
                              format(field.value, 'PPP HH:mm:ss')
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() ||
                            date < new Date('1900-01-01') ||
                            isLogging
                          }
                          initialFocus
                        />
                        <div className="p-2 border-t">
                          <Input
                            type="time"
                            step="1"
                            disabled={!field.value || isLogging}
                            value={
                              field.value ? format(field.value, 'HH:mm:ss') : ''
                            }
                            onChange={(e) => {
                              if (field.value) {
                                const [hours, minutes, seconds] = e.target.value
                                  .split(':')
                                  .map(Number);
                                const newDate = new Date(field.value);
                                newDate.setHours(hours, minutes, seconds);
                                field.onChange(newDate);
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The date and time the transaction occurred.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description (Optional) */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a brief description..."
                        className="resize-none"
                        {...field}
                        disabled={isLogging}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source System (Optional) */}
              <FormField
                control={form.control}
                name="sourceSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source System (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., POS, Online Banking"
                        {...field}
                        disabled={isLogging}
                      />
                    </FormControl>
                    <FormDescription>
                      Identifier of the system generating the transaction.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feedback Messages */}
              {logSuccess && (
                <div className="p-3 my-2 bg-green-100 text-green-800 border border-green-300 rounded-md">
                  Transaction logged successfully! Closing dialog...
                </div>
              )}
              {logError && (
                <div className="p-3 my-2 bg-red-100 text-red-800 border border-red-300 rounded-md">
                  Error: {logError}
                </div>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter className="mt-auto pt-4 border-t">
          {' '}
          {/* Ensure footer is at bottom */}
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isLogging}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="log-transaction-form"
            disabled={isLogging}
          >
            {isLogging ? 'Logging...' : 'Log Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogTransactionDialog;
