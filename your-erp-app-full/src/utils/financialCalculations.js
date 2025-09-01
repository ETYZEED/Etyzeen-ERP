import { formatRupiah } from './formatters.js';
import { financeData } from '../data/initialData.js';

// Validation functions
export const validateFinancialInput = (filter, sales, orders) => {
  const errors = [];
  
  // Validate filter parameter
  const validFilters = ['hari_ini', 'bulan_ini', 'tahun_ini', 'semua'];
  if (!validFilters.includes(filter)) {
    errors.push(`Invalid filter: ${filter}. Must be one of: ${validFilters.join(', ')}`);
  }
  
  // Validate sales data
  if (!Array.isArray(sales)) {
    errors.push('Sales data must be an array');
  } else {
    sales.forEach((sale, index) => {
      if (!sale.date || typeof sale.date !== 'string') {
        errors.push(`Sale at index ${index} is missing date or date is not a string`);
      }
      if (!sale.total || typeof sale.total !== 'string') {
        errors.push(`Sale at index ${index} is missing total or total is not a string`);
      }
    });
  }
  
  // Validate orders data
  if (typeof orders !== 'object' || orders === null) {
    errors.push('Orders data must be an object');
  } else {
    Object.entries(orders).forEach(([status, orderList]) => {
      if (!Array.isArray(orderList)) {
        errors.push(`Orders for status "${status}" must be an array`);
      } else {
        orderList.forEach((order, index) => {
          if (!order.date || typeof order.date !== 'string') {
            errors.push(`Order at index ${index} in status "${status}" is missing date or date is not a string`);
          }
          if (!order.total || typeof order.total !== 'string') {
            errors.push(`Order at index ${index} in status "${status}" is missing total or total is not a string`);
          }
        });
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const parseRupiah = (rupiahString) => {
  if (typeof rupiahString !== 'string') {
    console.warn('parseRupiah: Input must be a string, received:', typeof rupiahString);
    return 0;
  }
  
  const cleaned = rupiahString.replace(/[^0-9]/g, '');
  if (!cleaned) {
    console.warn('parseRupiah: No numeric characters found in:', rupiahString);
    return 0;
  }
  
  return parseFloat(cleaned);
};

export const validateDateString = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return { isValid: false, error: 'Date must be a non-empty string' };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `Invalid date format: ${dateString}` };
  }
  
  return { isValid: true, date };
};

export const getFinancialDataByFilter = (filter, sales, orders) => {
  // Validate input first
  const validation = validateFinancialInput(filter, sales, orders);
  if (!validation.isValid) {
    console.error('Financial data validation failed:', validation.errors);
    throw new Error(`Financial calculation failed: ${validation.errors.join(', ')}`);
  }

  const now = new Date();
  
  const filterDataByDate = (data) => {
    return data.filter(item => {
      const dateValidation = validateDateString(item.date);
      if (!dateValidation.isValid) {
        console.warn('Skipping invalid date item:', item);
        return false;
      }
      
      const itemDate = dateValidation.date;
      if (filter === 'hari_ini') {
        return now.toDateString() === itemDate.toDateString();
      } else if (filter === 'bulan_ini') {
        return now.getFullYear() === itemDate.getFullYear() && now.getMonth() === itemDate.getMonth();
      } else if (filter === 'tahun_ini') {
        return now.getFullYear() === itemDate.getFullYear();
      }
      return true;
    });
  };

  const filteredOfflineSales = filterDataByDate(sales);
  const filteredEcomOrders = filterDataByDate(Object.values(orders).flat());
  
  const totalRevenue = filteredOfflineSales.reduce((sum, sale) => sum + parseRupiah(sale.total), 0) + 
                       filteredEcomOrders.reduce((sum, order) => sum + parseRupiah(order.total), 0);
  
  // Validate financeData
  if (!Array.isArray(financeData)) {
    console.error('Finance data is not an array');
    throw new Error('Finance data configuration error');
  }
  
  const totalExpenses = financeData.reduce((sum, item) => {
    if (typeof item.Pengeluaran !== 'number') {
      console.warn('Invalid Pengeluaran value:', item.Pengeluaran);
      return sum;
    }
    return sum + item.Pengeluaran;
  }, 0);

  return {
    revenue: formatRupiah(totalRevenue),
    expenses: formatRupiah(totalExpenses),
    profit: formatRupiah(totalRevenue - totalExpenses),
    cash: formatRupiah(50000000), // Angka statis untuk demo
  };
};

export const calculateTrends = (filter, sales, orders) => {
  const now = new Date();
  const previousPeriod = getPreviousPeriod(filter, now);

  const currentData = getFinancialDataByFilter(filter, sales, orders);
  const previousData = getFinancialDataByFilterWithDate(filter, sales, orders, previousPeriod);

  const parseValue = (value) => parseFloat(value.replace(/[^0-9]/g, ''));

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    revenue: {
      value: currentData.revenue,
      trend: calculatePercentageChange(parseValue(currentData.revenue), parseValue(previousData.revenue)),
      rawValue: parseValue(currentData.revenue)
    },
    expenses: {
      value: currentData.expenses,
      trend: calculatePercentageChange(parseValue(currentData.expenses), parseValue(previousData.expenses)),
      rawValue: parseValue(currentData.expenses)
    },
    profit: {
      value: currentData.profit,
      trend: calculatePercentageChange(parseValue(currentData.profit), parseValue(previousData.profit)),
      rawValue: parseValue(currentData.profit)
    },
    cash: {
      value: currentData.cash,
      trend: 0, // Static for demo
      rawValue: parseValue(currentData.cash)
    }
  };
};

const getPreviousPeriod = (filter, currentDate) => {
  const date = new Date(currentDate);
  switch (filter) {
    case 'hari_ini':
      date.setDate(date.getDate() - 1);
      break;
    case 'bulan_ini':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'tahun_ini':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      return currentDate;
  }
  return date;
};

const getFinancialDataByFilterWithDate = (filter, sales, orders, customDate = null) => {
  const now = customDate || new Date();

  const filterDataByDate = (data) => {
    return data.filter(item => {
      const dateValidation = validateDateString(item.date);
      if (!dateValidation.isValid) {
        console.warn('Skipping invalid date item:', item);
        return false;
      }

      const itemDate = dateValidation.date;
      if (filter === 'hari_ini') {
        return now.toDateString() === itemDate.toDateString();
      } else if (filter === 'bulan_ini') {
        return now.getFullYear() === itemDate.getFullYear() && now.getMonth() === itemDate.getMonth();
      } else if (filter === 'tahun_ini') {
        return now.getFullYear() === itemDate.getFullYear();
      }
      return true;
    });
  };

  const filteredOfflineSales = filterDataByDate(sales);
  const filteredEcomOrders = filterDataByDate(Object.values(orders).flat());

  const totalRevenue = filteredOfflineSales.reduce((sum, sale) => sum + parseRupiah(sale.total), 0) +
                       filteredEcomOrders.reduce((sum, order) => sum + parseRupiah(order.total), 0);

  const totalExpenses = financeData.reduce((sum, item) => {
    if (typeof item.Pengeluaran !== 'number') {
      console.warn('Invalid Pengeluaran value:', item.Pengeluaran);
      return sum;
    }
    return sum + item.Pengeluaran;
  }, 0);

  return {
    revenue: formatRupiah(totalRevenue),
    expenses: formatRupiah(totalExpenses),
    profit: formatRupiah(totalRevenue - totalExpenses),
    cash: formatRupiah(50000000),
  };
};
