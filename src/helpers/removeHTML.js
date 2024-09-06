export const removeHTML = (htmlString) => {
  if (typeof htmlString !== 'string') {
    throw new Error('Input must be a string');
  }

  return htmlString.replace(/<\/?[^>]+(>|$)/g, '');
};
