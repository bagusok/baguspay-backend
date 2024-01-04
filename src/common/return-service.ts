export const returnService = (
  statusCode: number = 200,
  message: string,
  data?: object | Array<any>,
) => {
  return {
    statusCode,
    message,
    data,
  };
};
