export const makeResponse = ({ res, status = 200, data, message }) => {
  const responseData = { data, message };
  if (data === null || data === undefined) delete responseData.data;
  return res.status(status).json(responseData);
};
