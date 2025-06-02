import { ConstTemplate } from "@index/consts/Const";
import { Notification } from "@index/entity/Notification";
import { UserNotification } from "@index/entity/UserNotification";
import { User } from "@TenshiJS/entity/User";
import GenericRepository from "@TenshiJS/generics/Repository/GenericRepository";
import EmailService from "@TenshiJS/services/EmailServices/EmailService";
import { getEmailTemplate, getMessageEmail } from "@TenshiJS/utils/htmlTemplateUtils";

// Sends an email and stores a user notification
export async function sendEmailAndUserNotification(userNotifications: any, variables: any): Promise<UserNotification | null> {
    // Repositories to retrieve Notification, User, and create UserNotification
    const repositoryNotification = await new GenericRepository(Notification);
    const repositoryUser = await new GenericRepository(User);
    const repositoryUserNotification = await new GenericRepository(UserNotification);

    // Fetch the notification configuration by code
    const notification: Notification = await repositoryNotification.findByCode(userNotifications.notification, true);

    // Check if the notification exists and is configured to send an email
    if (notification && notification.required_send_email) {
        // Get the user who will receive the notification
        const user: User = await repositoryUser.findById(userNotifications.user_receive, true);

        // Determine if the message should be pulled from a localized JSON template
        const useJsonTemplate = notification.text_from_email_message_json;

        // Set which email template to use, just use the name without .html extension
        const template = notification.email_template ?? ConstTemplate.GENERIC_TEMPLATE_EMAIL;

        // Get the subject based on JSON keys if acronymous is defined, otherwise use default notification subject
        const subject = useJsonTemplate && userNotifications.acronymous
            ? getMessageEmail(userNotifications.acronymous, user.language!, "Subject")
            : notification.subject;

        // Get the email body content from JSON message file or use default message
        const bodyContent = useJsonTemplate && userNotifications.acronymous
            ? getMessageEmail(userNotifications.acronymous, user.language!, "EmailMessage")
            : notification.email_message;

        // Get the email title (for template variable use)
        const title = useJsonTemplate && userNotifications.acronymous
            ? getMessageEmail(userNotifications.acronymous, user.language!, "Title")
            : notification.subject;

        // Merge required variables into the template rendering context,
        // ensuring these keys always override external ones
        variables = {
            userName: user.name,
            emailSubject: title,
            emailContent: bodyContent,
            ...variables,
        };

        // Render the final HTML email using the selected template and variables
        const htmlBody = await getEmailTemplate(template, user.language, variables);

        // Send the email
        const emailService = EmailService.getInstance();
        await emailService.sendEmail({
            //toMail: user.email,
            toMail: "fabian7593@gmail.com",
            subject,
            message: htmlBody,
            attachments: [],
        });
    }

    // Create and store the user notification in the database
    const userNotificationAdded: UserNotification = await repositoryUserNotification.add(userNotifications);
    return userNotificationAdded;
}