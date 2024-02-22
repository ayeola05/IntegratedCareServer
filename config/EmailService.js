import nodemailer from "nodemailer";
import generateToken from "../utils/generateToken.js";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD,
  },
});

const mailer = async ({ _id, email }, confirmationUrl) => {
  try {
    const emailToken = generateToken(_id);
    const url = `${confirmationUrl}/${emailToken}
    `;
    await transporter.sendMail({
      from: {
        name: "Integrated Care",
        address: process.env.MAILER_EMAIL,
      },
      to: email,
      subject: "Confirm Mail",
      html: `<h1>Welcome to Integrated Care</h1> Please click this link to confirm your email: <a href="${url}">Confirm Email</a> <p>We can't wait to have you onboard</p>`,
    });

    console.log(url);
  } catch (e) {
    console.log(e);
  }
};

export default mailer;
