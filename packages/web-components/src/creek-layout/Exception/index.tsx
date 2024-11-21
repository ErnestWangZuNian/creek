export * from "./NotFound";

export type ExceptionProps = {
  children?: React.ReactNode;
};

export const Exception = (props: ExceptionProps) => {
  const { children } = props;
  return <div>{children}</div>;
};
