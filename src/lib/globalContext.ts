import { createContext } from 'react';

const globalContext = createContext<{
  addingCompare: boolean;
  setAddingCompare: (value: boolean) => void;
}>({
  addingCompare: false,
  setAddingCompare: () => {},
});

export default globalContext;
