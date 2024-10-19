const extractMarkdownContent = (responseMessage) => {
  try {
    // Flexible regex to handle various cases
    const markdownMatch = responseMessage.match(/```markdown\s*([\s\S]*?)(```|$)/);

    if (markdownMatch && markdownMatch[1]) {
      return markdownMatch[1].trim(); // Return trimmed markdown content
    }
    return responseMessage; // Return raw response if no match
  } catch (error) {
    throw new Error('Error processing markdown content');
  }
};

export default extractMarkdownContent;
