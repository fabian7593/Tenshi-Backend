// src/entity/Notification.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  //This is the unique code for the notification, it can be used to identify the type of notification.
  @Column({ type: "varchar", length: 60, unique: true })
  code: string;

  //This is the type of notificaction, it can be used to categorize notifications.
  @Column({ type: "enum", 
            enum: ["APPOINTMENT", "APPOINTMENT_CREDIT", "GENERAL", "SYSTEM"], 
            default: "GENERAL" })
  type: string; 

  //This is the subject of the notification, you can write the specific subject, or just the name from the emailMessages.json
  @Column({ type: "varchar", length: 100, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" })
  subject: string;

  //This is the message of the notification, you can write the specific message, or just the name from the emailMessages.json
  @Column({ type: "varchar", length: 800, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" })
  email_message: string;

  //This is another message, maybe for show into front end or something like that, this is not used in the email.
  @Column({ type: "varchar", length: 800, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" })
  another_message: string;

  //This is another message, maybe for show into front end or something like that, this is not used in the email.
  @Column({ type: "varchar", length: 800, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" })
  notification_message: string;

  // This is a boolean to indicate if the notification requires to send an email.
  @Column({ type: "tinyint", default: 0 })
  required_send_email: boolean;

  // This is a boolean to indicate if the notification requires to get the text of the message from the emailMessages.json file.
  //If this is true, the subject, message and another_message will be taken from codes of the emailMessages.json file.
  @Column({ type: "tinyint", default: 0 })
  text_from_email_message_json: boolean;

  // This is the email template to use, you can write the specific template, if yopu dont have specific tempalte, just send a text
  @Column({ type: "varchar", length: 100, nullable: true })
  email_template: string | null; 

  // This is the URL to redirect the user when he clicks on the notification, or ion the button inside the email
  @Column({ type: "varchar", length: 800, nullable: true, default: null, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" })
  action_url: string | null;

  // This is the text to show in the button inside the email, if you dont have a specific text, just send null
  @Column({ type: "varchar", length: 400, nullable: true, default: null, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" })
  action_text: string | null;

  // This is the language of the notification, you can use the default language from the config, or just send a specific language
  @Column({ type: "varchar", length: 10, nullable: true, default: "es" })
  language: string | null;

  @Column({ type: "tinyint", default: 0 })
  is_deleted: boolean;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_date: Date;

  @Column({ type: "timestamp", nullable: true, default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_date: Date | null;

}
