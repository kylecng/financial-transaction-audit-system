import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFilterStore } from '@/stores/filterStore';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns'; // date-fns is commonly used with shadcn calendar
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { TransactionFilters } from '@/types';
import { cn } from '@/lib/utils'; // For conditional classes

const transactionTypeOptions = ['Credit', 'Debit', 'Transfer'];

const FilterControls: React.FC = () => {
  const { filters, setFilters, clearFilters } = useFilterStore();
  const user = useAuthStore((state) => state.user);

  // Local state for controlled inputs
  const [localKeyword, setLocalKeyword] = useState(filters.keyword || '');
  const [localTransactionType, setLocalTransactionType] = useState(
    filters.transactionType || ''
  );
  const [localAccountId, setLocalAccountId] = useState(filters.accountId || '');
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );
  const [localMinAmount, setLocalMinAmount] = useState(
    filters.minAmount?.toString() || ''
  );
  const [localMaxAmount, setLocalMaxAmount] = useState(
    filters.maxAmount?.toString() || ''
  );

  // --- Debounced and Throttled Store Updates ---

  // Memoized function to update the store filters
  const updateStoreFilters = useCallback(
    (newFilters: Partial<TransactionFilters>) => {
      setFilters(newFilters);
      // Note: transactionStore subscription handles fetching and resetting page
    },
    [setFilters]
  );

  // Debounced update for keyword
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetKeyword = useMemo(
    () =>
      debounce((value: string) => {
        updateStoreFilters({ keyword: value || undefined });
      }, 300), // 300ms debounce delay
    [updateStoreFilters] // Dependency
  );

  // Throttled update for other filters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledSetFilters = useMemo(
    () =>
      throttle((newFilters: Partial<TransactionFilters>) => {
        updateStoreFilters(newFilters);
      }, 500), // 500ms throttle delay
    [updateStoreFilters] // Dependency
  );

  // Cleanup throttled/debounced functions on unmount
  useEffect(() => {
    return () => {
      debouncedSetKeyword.cancel();
      throttledSetFilters.cancel();
    };
  }, [debouncedSetKeyword, throttledSetFilters]);

  // --- Input Handlers ---

  const handleKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setLocalKeyword(value);
      debouncedSetKeyword(value);
    },
    [debouncedSetKeyword]
  );

  const handleTransactionTypeChange = useCallback(
    (value: string) => {
      setLocalTransactionType(value);
      throttledSetFilters({ transactionType: value || undefined });
    },
    [throttledSetFilters]
  );

  const handleAccountIdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setLocalAccountId(value);
      throttledSetFilters({ accountId: value || undefined });
    },
    [throttledSetFilters]
  );

  const handleDateChange = useCallback(
    (filterName: 'startDate' | 'endDate', date: Date | undefined) => {
      if (filterName === 'startDate') {
        setLocalStartDate(date);
      } else {
        setLocalEndDate(date);
      }
      // Format date to YYYY-MM-DD for the API/store, or undefined if cleared
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : undefined;
      throttledSetFilters({ [filterName]: formattedDate });
    },
    [throttledSetFilters]
  );

  const handleAmountChange = useCallback(
    (
      filterName: 'minAmount' | 'maxAmount',
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const value = event.target.value;
      const numericValue = value === '' ? undefined : Number(value);

      if (filterName === 'minAmount') {
        setLocalMinAmount(value);
      } else {
        setLocalMaxAmount(value);
      }
      throttledSetFilters({ [filterName]: numericValue });
    },
    [throttledSetFilters]
  );

  // Handler for clearing all filters
  const handleClearFilters = useCallback(() => {
    clearFilters(); // Clears the store
    // Reset local state explicitly
    setLocalKeyword('');
    setLocalTransactionType('');
    setLocalAccountId('');
    setLocalStartDate(undefined);
    setLocalEndDate(undefined);
    setLocalMinAmount('');
    setLocalMaxAmount('');
  }, [clearFilters]);

  // Effect to sync local state if filters change externally (e.g., via clearFilters)
  useEffect(() => {
    setLocalKeyword(filters.keyword || '');
    setLocalTransactionType(filters.transactionType || '');
    setLocalAccountId(filters.accountId || '');
    setLocalStartDate(
      filters.startDate ? new Date(filters.startDate) : undefined
    );
    setLocalEndDate(filters.endDate ? new Date(filters.endDate) : undefined);
    setLocalMinAmount(filters.minAmount?.toString() || '');
    setLocalMaxAmount(filters.maxAmount?.toString() || '');
  }, [filters]); // Re-run only when store filters change

  return (
    <div className="p-4 border rounded mb-4 bg-card text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div className="space-y-1">
          <Label htmlFor="keyword">Keyword Search</Label>
          <Input
            id="keyword"
            placeholder="Search description..."
            value={localKeyword}
            onChange={handleKeywordChange}
          />
        </div>

        {/* Transaction Type */}
        <div className="space-y-1">
          <Label htmlFor="transactionType">Transaction Type</Label>
          <Select
            value={localTransactionType}
            onValueChange={handleTransactionTypeChange}
          >
            <SelectTrigger id="transactionType">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {transactionTypeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account ID */}
        <div className="space-y-1">
          <Label htmlFor="accountId">Account ID</Label>
          <Input
            id="accountId"
            placeholder="Account identifier"
            value={localAccountId}
            onChange={handleAccountIdChange}
          />
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <Label htmlFor="startDate">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !localStartDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localStartDate ? (
                  format(localStartDate, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localStartDate}
                onSelect={(date) => handleDateChange('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <Label htmlFor="endDate">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !localEndDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localEndDate ? (
                  format(localEndDate, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localEndDate}
                onSelect={(date) => handleDateChange('endDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Min Amount */}
        <div className="space-y-1">
          <Label htmlFor="minAmount">Min Amount</Label>
          <Input
            id="minAmount"
            type="number"
            placeholder="Minimum amount"
            value={localMinAmount}
            onChange={(e) => handleAmountChange('minAmount', e)}
            min="0"
            step="0.01"
          />
        </div>

        {/* Max Amount */}
        <div className="space-y-1">
          <Label htmlFor="maxAmount">Max Amount</Label>
          <Input
            id="maxAmount"
            type="number"
            placeholder="Maximum amount"
            value={localMaxAmount}
            onChange={(e) => handleAmountChange('maxAmount', e)}
            min="0"
            step="0.01"
          />
        </div>

        {/* Clear Filters Button - Placed outside the grid for better alignment */}
        <div className="flex items-end justify-end sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Role Indication (Optional) */}
      <p className="text-sm text-muted-foreground mt-4">
        {user?.role === 'transactor'
          ? 'Showing filters for your transactions.'
          : 'Showing filters for all transactions.'}
      </p>
    </div>
  );
};

export default FilterControls;
