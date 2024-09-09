export const extractArrayFromResponse = (gptResponse) => {
  try {
    const arrayStart = gptResponse.indexOf('[');
    const arrayEnd = gptResponse.indexOf(']') + 1;
    const arrayString = gptResponse.substring(arrayStart, arrayEnd);

    // Parse the extracted string into an array
    const array = JSON.parse(arrayString);

    return array;
  } catch (error) {
    return [];
  }
};
