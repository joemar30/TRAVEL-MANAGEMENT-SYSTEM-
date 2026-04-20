import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma, initDB } from "./db.js";
import { nanoid } from "nanoid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await initDB();

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(cors());

  const server = createServer(app);
  const SECRET = process.env.JWT_SECRET || 'travel_secret';

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Missing token" });

    jwt.verify(token, SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  };

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", backendPort: process.env.PORT || 5050 });
  });

  // ──── Auth Endpoints ────

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { full_name, email, password, role, security_question, security_answer } = req.body;
      const userRole = role === 'admin' ? 'admin' : 'client';
      const id = nanoid();
      const hashedPass = await bcrypt.hash(password, 10);
      
      let hashedSecurityAnswer = null;
      if (security_answer) {
        hashedSecurityAnswer = await bcrypt.hash(security_answer.toLowerCase().trim(), 10);
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: "Email already exists" });

      await prisma.user.create({
        data: { 
          id, full_name, email, password: hashedPass, role: userRole, 
          security_question: security_question || null,
          security_answer: hashedSecurityAnswer 
        }
      });

      const token = jwt.sign({ id, email, role: userRole }, SECRET);
      res.json({ user: { id, full_name, email, role: userRole }, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: "User not found" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: "Invalid password" });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET);
      res.json({ 
        user: { 
          id: user.id, 
          full_name: user.full_name, 
          email: user.email, 
          role: user.role, 
          avatar: user.avatar,
          phone: user.phone,
          company: user.company
        }, 
        token 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/forgot-password/check", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        // Obscure error to prevent email enumeration, but for feature clarity we return not found
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!user.security_question) {
        return res.status(403).json({ error: "No security question configured for this account. Contact an administrator." });
      }

      res.json({ question: user.security_question });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/forgot-password/reset", async (req, res) => {
    try {
      const { email, answer, newPassword } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user || !user.security_answer) {
        return res.status(403).json({ error: "Cannot process request." });
      }

      const valid = await bcrypt.compare(answer.toLowerCase().trim(), user.security_answer);
      if (!valid) {
        return res.status(401).json({ error: "Security answer is incorrect. You are not allowed to change the password." });
      }

      const hashedNewPass = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPass }
      });

      res.json({ message: "Password updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/auth/profile", authenticateToken, async (req: any, res) => {
    try {
      const { full_name, email, phone, company, avatar } = req.body;
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(full_name && { full_name }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(company && { company }),
          ...(avatar && { avatar })
        }
      });
      // Return user without password
      const { password, security_answer, ...userWithoutPass } = updatedUser as any;
      res.json(userWithoutPass);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });



  // ──── Trips Endpoints ────

  app.get("/api/trips", authenticateToken, async (req: any, res) => {
    try {
      let whereClause = {};

      if (req.user.role !== 'admin') {
        // Find all admin IDs
        const adminUsers = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
        const adminIds = adminUsers.map((u: any) => u.id);

        whereClause = {
          OR: [
            { user_id: req.user.id },
            { user_id: { in: adminIds } }
          ]
        };
      }

      // Return all trips for admin, and specific trips for clients
      const trips = await prisma.trip.findMany({ 
        where: whereClause,
        orderBy: { created_at: 'desc' }
      });
      res.json(trips);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/trips", authenticateToken, async (req: any, res) => {
    try {
      const { destination, startDate, endDate, nights } = req.body;
      const id = nanoid();
      await prisma.trip.create({
        data: {
          id,
          user_id: req.user.id,
          destination,
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          nights: Number(nights)
        }
      });
      res.json({ id, destination, startDate, endDate, nights });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/trips/:id", authenticateToken, async (req: any, res) => {
    try {
      const { destination, startDate, endDate, nights } = req.body;
      await prisma.trip.updateMany({
        where: { id: req.params.id, user_id: req.user.id },
        data: {
          ...(destination && { destination }),
          ...(startDate && { start_date: new Date(startDate) }),
          ...(endDate && { end_date: new Date(endDate) }),
          ...(nights !== undefined && { nights: Number(nights) })
        }
      });
      res.json({ message: "Trip updated" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/trips/:id", authenticateToken, async (req: any, res) => {
    try {
      await prisma.trip.deleteMany({
        where: { id: req.params.id, user_id: req.user.id }
      });
      res.json({ message: "Trip deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Bookings Endpoints ────

  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      let whereClause = {};
      if (req.user.role !== 'admin') {
        whereClause = { user_id: req.user.id };
      }
      
      const bookings = await prisma.booking.findMany({ 
        where: whereClause,
        include: { user: { select: { full_name: true, email: true } } },
        orderBy: { created_at: 'desc' }
      });
      
      res.json(bookings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const { type, name, route, property, startDate, endDate, price, notes, tripId } = req.body;
      const id = nanoid();
      await prisma.booking.create({
        data: {
          id,
          user_id: req.user.id,
          trip_id: tripId || null,
          type,
          name: name || null,
          route: route || null,
          property: property || null,
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          price: Number(price),
          notes: notes || null,
          status: 'in-review'
        }
      });
      res.json({ id, status: 'in-review' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });
      const { status, notes, admin_comment } = req.body;
      console.log(`[PATCH /api/bookings/${req.params.id}] Status update to: ${status}`);
      
      const updatedBooking = await (prisma.booking as any).update({
        where: { id: req.params.id },
        data: { 
          ...(status !== undefined && { status }),
          ...(notes !== undefined && { notes }),
          ...(admin_comment !== undefined && { admin_comment }),
          status_updated_at: new Date()
        },
        include: { user: { select: { full_name: true, email: true } } }
      });
      res.json(updatedBooking);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });
      await prisma.booking.delete({ where: { id: req.params.id } });
      res.json({ message: "Booking deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Expenses Endpoints ────
  app.get("/api/expenses", authenticateToken, async (req: any, res) => {
    try {
      let whereClause = {};
      if (req.user.role !== 'admin') {
        whereClause = { user_id: req.user.id };
      }
      const expenses = await prisma.expense.findMany({ 
        where: whereClause,
        orderBy: { created_at: 'desc' }
      });
      res.json(expenses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/expenses", authenticateToken, async (req: any, res) => {
    try {
      const { trip_id, category, amount, date, description } = req.body;
      const id = nanoid();
      await prisma.expense.create({
        data: {
          id,
          user_id: req.user.id,
          trip_id: trip_id || null,
          category,
          amount: Number(amount),
          date: new Date(date),
          description: description || null
        }
      });
      res.json({ id, category, amount, date });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/expenses/:id", authenticateToken, async (req: any, res) => {
    try {
      const updates = { ...req.body };
      if (updates.date) updates.date = new Date(updates.date);
      if (updates.amount) updates.amount = Number(updates.amount);
      await prisma.expense.updateMany({
        where: { id: req.params.id, user_id: req.user.id },
        data: updates
      });
      res.json({ message: "Expense updated" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/expenses/:id", authenticateToken, async (req: any, res) => {
    try {
      await prisma.expense.deleteMany({
        where: { id: req.params.id, user_id: req.user.id }
      });
      res.json({ message: "Expense deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Travelers Endpoints ────
  app.get("/api/travelers", authenticateToken, async (req: any, res) => {
    try {
      let whereClause = {};
      if (req.user.role !== 'admin') {
        whereClause = { user_id: req.user.id };
      }
      const travelers = await prisma.traveler.findMany({ 
        where: whereClause,
        orderBy: { created_at: 'desc' }
      });
      res.json(travelers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/travelers", authenticateToken, async (req: any, res) => {
    try {
      const { name, email, passportNumber, seatPreference, loyaltyNumbers } = req.body;
      const id = nanoid();
      await prisma.traveler.create({
        data: {
          id,
          user_id: req.user.id,
          name,
          email,
          passport_number: passportNumber || null,
          seat_preference: seatPreference || null,
          loyalty_numbers: loyaltyNumbers ? JSON.stringify(loyaltyNumbers) : null
        }
      });
      res.json({ id, name, email });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/travelers/:id", authenticateToken, async (req: any, res) => {
    try {
      const updates = { ...req.body };
      if (updates.loyaltyNumbers !== undefined) {
          updates.loyalty_numbers = JSON.stringify(updates.loyaltyNumbers);
          delete updates.loyaltyNumbers;
      }
      await prisma.traveler.updateMany({
        where: { id: req.params.id, user_id: req.user.id },
        data: updates
      });
      res.json({ message: "Traveler updated" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/travelers/:id", authenticateToken, async (req: any, res) => {
    try {
      await prisma.traveler.deleteMany({
        where: { id: req.params.id, user_id: req.user.id }
      });
      res.json({ message: "Traveler deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Settings Endpoints ────
  app.get("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      const settings = await prisma.userSettings.findUnique({
        where: { user_id: req.user.id }
      });
      if (!settings) {
        return res.json({ company_name: 'Acme Travel Inc.', currency: 'USD', budget_threshold: 10000 });
      }
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/settings", authenticateToken, async (req: any, res) => {
    try {
        const updates = { ...req.body };
        // Ensure numbers and floats are correct if needed, but Prisma will cast some.
        // Let's rely on Prisma upsert
        await prisma.userSettings.upsert({
            where: { user_id: req.user.id },
            update: updates,
            create: {
                user_id: req.user.id,
                ...updates
            }
        });
        res.json({ message: "Settings updated" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Static Site Serving ────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    if (_req.url.startsWith('/api')) return;
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`API endpoints active on /api`);
  });
}

startServer().catch(console.error);
