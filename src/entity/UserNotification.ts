// src/entity/UserNotification.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Notification } from "./Notification";
import { User } from "@TenshiJS/entity/User";

@Entity("user_notifications")
export class UserNotification {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

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

  //the payload for user notification, this is a json object that can contain any data
  @Column({ type: "json", nullable: true })
  payload: any;

  // this identify if the notification is read or not, 0 for not read, 1 for read
  @Column({ type: "tinyint", default: 0 })
  is_read: boolean;

  // this identify if the notification is deleted or not, 0 for not deleted, 1 for deleted
  @Column({ type: "tinyint", default: 0 })
  is_deleted: boolean;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_date: Date;

  //the specific notificacion settings
  @ManyToOne(() => Notification, notification => notification.id)
  @JoinColumn({ name: "notification", referencedColumnName: "code" })
  notification: Notification;

  //the user that send the notification, this can be null if the notification is sent by the system
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: "user_send", referencedColumnName: "id" })
  user_send: User | null;

  //the user that receive the notification, this is required
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: "user_receive", referencedColumnName: "id" })
  user_receive: User;
}
