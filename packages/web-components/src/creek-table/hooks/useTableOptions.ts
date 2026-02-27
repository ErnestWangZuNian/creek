import { ParamsType, ProTableProps } from '@ant-design/pro-components';
import { useSafeState } from 'ahooks';
import { useEffect } from 'react';

/**
 * Hook to manage ProTable options logic including density and settings
 * 
 * @param options User provided options configuration
 * @param size User provided size (density)
 * @returns { finalOptions, tableSize, setTableSize }
 */
export const useTableOptions = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(
  options: ProTableProps<T, U, ValueType>['options'],
  size?: ProTableProps<T, U, ValueType>['size']
): {
  finalOptions: ProTableProps<T, U, ValueType>['options'];
  tableSize: ProTableProps<T, U, ValueType>['size'];
  setTableSize: React.Dispatch<React.SetStateAction<ProTableProps<T, U, ValueType>['size']>>;
} => {
  // Manage table density state, defaulting to 'small' (compact)
  // Supports controlled mode and switching
  const [tableSize, setTableSize] = useSafeState<ProTableProps<T, U, ValueType>['size']>(size || 'small');

  // Sync internal state if size prop changes
  useEffect(() => {
    if (size) {
      setTableSize(size);
    }
  }, [size]);

  // Merge default options with user provided options
  // Default: show density and setting, hide reload and fullScreen
  const finalOptions: ProTableProps<T, U, ValueType>['options'] =
    options === false
      ? false
      : {
          density: true,
          setting: true,
          reload: false,
          fullScreen: false,
          ...options,
        };

  return {
    finalOptions,
    tableSize,
    setTableSize,
  };
};
