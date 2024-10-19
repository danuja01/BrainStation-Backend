const extractMarkdownContent = (responseMessage) => {
  try {
    // Flexible regex to handle various cases
    const markdownMatch = responseMessage.match(/```markdown\s*([\s\S]*?)(```|$)/);

    if (markdownMatch && markdownMatch[1]) {
      return markdownMatch[1].trim(); // Return trimmed markdown content
    } else {
      return responseMessage; // Return raw response if no match
    }
  } catch (error) {
    console.error(`Error extracting markdown content: ${error}`);
    throw new Error('Error processing markdown content');
  }
};

export default extractMarkdownContent;
