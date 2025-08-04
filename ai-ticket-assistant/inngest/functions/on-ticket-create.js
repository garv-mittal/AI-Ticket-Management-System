import { inngest } from "../client.inngest.js";
import Ticket from "../../models/ticket.model.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.util.js";
import analyzeTicket from "../../utils/ai.util.js";

/**
 * Inngest function triggered when a ticket is created.
 * - Fetches the ticket
 * - Updates status to TODO
 * - Uses AI to analyze and enrich the ticket
 * - Assigns it to a moderator/admin based on matching skills
 * - Sends an email notification to the assigned moderator
 **/

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // 1️⃣ fetch ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticket) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      // 2️⃣ Immediately set the status to "TODO"
      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      // 3️⃣ Analyze the ticket using AI for summary, priority, skills, and notes
      const aiResponse = await analyzeTicket(ticket);

      // 4️⃣ If AI succeeded, update ticket details + extract skills
      const relatedskills = await step.run("ai-processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });
          skills = aiResponse.relatedSkills;
        }
        return skills;
      });

      // 5️⃣ Assign to a moderator who has any matching skill (fallback: admin)
      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedskills.join("|"),
              $options: "i",
            },
          },
        });
        // Fallback to admin if no matching moderator
        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }
        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });
        return user;
      });

      // 6️⃣ Send email notification to the assigned moderator (if any)
      await step.run("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket.title}`
          );
        }
      });

      return { success: true };
    } catch (err) {
      console.error(" Error running the step", err.message);
      return { success: false };
    }
  }
);