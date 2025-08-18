export type CreekSearchAddFilterOption = {
  value: any;
  displayText?: string;
};

export type CreekSearchFilter = CreekSearchAddFilterOption & {
  dataIndex: string;
  title: string;
};
