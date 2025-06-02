import fs from 'fs';
import path from 'path';
import ConfigManager  from "tenshi/config/ConfigManager";
const config = ConfigManager.getInstance().getConfig();

const templatesDir = path.join(__dirname, config.URL_FILES.TEMPLATES_PATH);
const messagesMultiLanguagesDir = path.join(__dirname, config.URL_FILES.EMAIL_LANGUAGES_PATH);

/**
 * Loads the JSON file of messages for the selected language.
 *
 * @param {string} language - The language code for the desired language.
 * @return {Object.<string, string>} - An object containing the messages for the specified language.
 */
function loadMessages(language: string): { [key: string]: string } {
    // Generate the file path for the selected language
    let filePath = path.join(messagesMultiLanguagesDir, `emailMessages.${language}.json`);

    if (!fs.existsSync(filePath)) {
        filePath = path.join(messagesMultiLanguagesDir, `emailMessages.en.json`);
    }
    
    // Read the contents of the file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse the JSON and return the messages object
    return JSON.parse(fileContents);
}




export function getMessageEmail(key: string, language: string, acronymous: string | null = null): string {
    const messages = loadMessages(language);
    return messages[key + (acronymous == null ? "Subject" : acronymous)];
}

/**
 * Replaces the text in the HTML template with the provided messages and variables.
 *
 * @param {string} template - The HTML template to be updated.
 * @param {Object.<string, string>} messages - The messages to replace the placeholders in the template.
 * @param {Object.<string, string>} variables - The dynamic variables to replace in the template.
 * @return {string} The updated HTML template.
 */
function replaceTemplateText(template: string, messages: { [key: string]: string }, variables: { [key: string]: string }): string {
    let updatedTemplate = template;
    
    // Replace messages placeholders
     updatedTemplate = replaceVariables(updatedTemplate, messages);

      // Replace company related placeholders
      updatedTemplate = updatedTemplate
      // Replace company domain placeholder
      .replace(/\{\{ companyDomain \}\}/g, config.COMPANY.LANDING_PAGE)
      // Replace company name placeholder
      .replace(/\{\{ companyName \}\}/g, config.COMPANY.NAME)
      // Replace company logo placeholder
      .replace(/\{\{ companyLogo \}\}/g, config.COMPANY.LOGO)
      // Replace main color placeholder
      .replace(/mainColor/g, config.COMPANY.MAIN_COLOR)
      // Replace background color
      .replace(/backgroundColor/g, config.COMPANY.BACKGROUND_COLOR)
      // Replace year by the current year
      .replace(/\{\{ year \}\}/g, new Date().getFullYear().toString());

    // Replace dynamic variables placeholders
     updatedTemplate = replaceVariables(updatedTemplate, variables);

    return updatedTemplate;
}


export function replaceVariables(template:string, jsonData: { [key: string]: string }): string {

    for (const [key, value] of Object.entries(jsonData)) {
        // Replace the variable placeholder in the template
        const placeholder = `{{ ${key} }}`;
        const regex = new RegExp(placeholder, 'g');
        template = template.replace(regex, value);
    }

    return template;
}
    

/**
 * Retrieves an email template for the specified language and replaces the placeholders with the provided variables.
 *
 * @param {string} templateName - The name of the email template file (without the extension).
 * @param {string} language - The language code for the desired template.
 * @param {Object.<string, string>} variables - The dynamic variables to replace in the template.
 * @return {string} The updated HTML template.
 */
// Ejemplo de uso
export function getEmailTemplate(templateName: string, language: string | null, variables: { [key: string]: string }): string {
    // Construct the path to the email template file
    const templatePath = path.join(templatesDir, `${templateName}.html`);

    // Read the contents of the email template file
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    // Load the messages for the specified language
    const messages = loadMessages(language == null ? config.SERVER.DEFAULT_LANGUAGE : language);

    // Replace the placeholders in the template with the provided variables and messages
    return replaceTemplateText(templateContent, messages, variables);
}
