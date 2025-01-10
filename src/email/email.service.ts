// import Mail = require('nodemailer/lib/mailer');
// import * as nodemailer from 'nodemailer';

// import { Injectable } from '@nestjs/common';

// interface EmailOptions {
//   to: string;
//   subject: string;
//   html: string;
// }

// @Injectable()
// export class EmailService {
//   private transporter: Mail;

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: 'aleum.yu@gmail.com',
//         pass: '',
//       },
//     });
//   }

//   async sendMemberJoinVerification(emailAddress: string, token: string) {
//     const baseUrl = 'http://localhost:3000';
//     const url = `${baseUrl}/users/verify?token=${token}`;
//     const mailOptions: EmailOptions = {
//       to: emailAddress,
//       subject: '가입 인증 메일',
//       html: `Click the button to confirm your sign up.'<br/>
//         <form action="${url}" method="POST"
//         <button>Confirm</button>
//         </form>`,
//     };
//     return await this.transporter.sendMail(mailOptions);
//   }
// }
