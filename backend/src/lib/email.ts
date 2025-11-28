import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrganizationInvitation({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}) {
  await resend.emails.send({
    from: "kanbased@mail.kanbased.com",
    to: email,
    subject: `You're invited to join ${teamName}`,
    html: `<p>You're invited to join ${teamName} by ${invitedByUsername} from ${invitedByEmail}. Click the link to join the team: <a href="${inviteLink}">${inviteLink}</a></p>`,
  });
}

// Don't know why if I export resend.emails.send, it doesn't work.
// So I exported the resend object instead.
export default resend;
