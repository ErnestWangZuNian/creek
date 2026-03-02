import { ParamsType, ProTableProps } from '@ant-design/pro-components';
import { useSafeState } from 'ahooks';
import { useEffect, useRef } from 'react';
import { DensityIcon } from '../components';

/**
 * Hook to manage ProTable options logic including density and settings
 * 
 * @param options User provided options configuration
 * @param size User provided size (density)
 * @returns { finalOptions, tableSize, setTableSize }
 */
export const useTableOptions = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(
  options: ProTableProps<T, U, ValueType>['options'],
  size?: ProTableProps<T, U, ValueType>['size'],
  optionsRender?: ProTableProps<T, U, ValueType>['optionsRender']
): {
  finalOptions: ProTableProps<T, U, ValueType>['options'];
  tableSize: ProTableProps<T, U, ValueType>['size'];
  setTableSize: React.Dispatch<React.SetStateAction<ProTableProps<T, U, ValueType>['size']>>;
  showDensity: boolean;
  finalOptionsRender: ProTableProps<T, U, ValueType>['optionsRender'];
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

  // Use ref to store latest tableSize to avoid stale closures in optionsRender
  const tableSizeRef = useRef(tableSize);
  tableSizeRef.current = tableSize;

  // Merge default options with user provided options
  // Default: show density and setting, hide reload and fullScreen
  const showDensity = options !== false && (options?.density !== false);

  const finalOptions: ProTableProps<T, U, ValueType>['options'] =
    options === false
      ? false
      : {
          setting: true,
          reload: false,
          fullScreen: false,
          ...options,
          density: false,
        };

  const finalOptionsRender: ProTableProps<T, U, ValueType>['optionsRender'] = (opts, defaultDom) => {
    const doms = [...defaultDom];
    const currentTableSize = tableSizeRef.current;
    
    if (showDensity) {
      doms.unshift(
        <DensityIcon 
          key="density" 
          tableSize={currentTableSize} 
          setTableSize={setTableSize} 
        />
      );
    }

    if (optionsRender) {
      return optionsRender(opts, doms);
    }
    return doms;
  };

  return {
    finalOptions,
    tableSize,
    setTableSize,
    showDensity,
    finalOptionsRender,
  };
};
