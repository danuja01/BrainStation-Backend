import { moduleLogger } from '@sliit-foss/module-logger';

const logger = moduleLogger('Extract-Json-Array');

const extractJsonArray = (responseMessage) => {
  try {
    const jsonMatch = responseMessage.match(/(\[.*\])/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error('No valid JSON array found in the response');
  } catch (error) {
    logger.error(`Error extracting JSON array: ${error}`);
    throw new Error('Received non-JSON response from OpenAI');
  }
};

export default extractJsonArray;
