import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "./db.js"; // Ensure .js extension for ES modules if needed or config appropriately
import { nanoid } from "nanoid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors()); // In production, restrict this

  const server = createServer(app);
  const SECRET = process.env.JWT_SECRET || 'wayfarer_secret';

  // ──── Auth Endpoints ────

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { full_name, email, password, role } = req.body;
      const userRole = role === 'admin' ? 'admin' : 'client';
      const id = nanoid();
      const hashedPass = await bcrypt.hash(password, 10);

      const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]) as any[];
      if (existing.length > 0) return res.status(400).json({ error: "Email already exists" });

      await pool.query(
        "INSERT INTO users (id, full_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [id, full_name, email, hashedPass, userRole]
      );

      const token = jwt.sign({ id, email, role: userRole }, SECRET);
      res.json({ user: { id, full_name, email, role: userRole }, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]) as any[];
      if (users.length === 0) return res.status(401).json({ error: "User not found" });

      const user = users[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: "Invalid password" });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET);
      res.json({ 
        user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, avatar: user.avatar }, 
        token 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Middleware for Authenticated Routes ────
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

  // ──── Trips (Itineraries) Endpoints ────

  app.get("/api/trips", authenticateToken, async (req: any, res) => {
    try {
      const [trips] = await pool.query("SELECT * FROM trips WHERE user_id = ?", [req.user.id]);
      res.json(trips);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/trips", authenticateToken, async (req: any, res) => {
    try {
      const { destination, startDate, endDate, nights } = req.body;
      const id = nanoid();
      await pool.query(
        "INSERT INTO trips (id, user_id, destination, start_date, end_date, nights) VALUES (?, ?, ?, ?, ?, ?)",
        [id, req.user.id, destination, startDate, endDate, nights]
      );
      res.json({ id, destination, startDate, endDate, nights });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Bookings Endpoints ────

  // ──── Bookings Endpoints ────

  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      // Admin sees everything, client sees only their own
      let sql = "SELECT * FROM bookings";
      let params: any[] = [];
      if (req.user.role !== 'admin') {
        sql += " WHERE user_id = ?";
        params = [req.user.id];
      }
      const [bookings] = await pool.query(sql, params);
      res.json(bookings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const { type, name, route, property, startDate, endDate, price, notes, tripId } = req.body;
      const id = nanoid();
      await pool.query(
        "INSERT INTO bookings (id, user_id, trip_id, type, name, route, property, start_date, end_date, price, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in-review', ?)",
        [id, req.user.id, tripId || null, type, name || null, route || null, property || null, startDate, endDate, price, notes || null]
      );
      res.json({ id, status: 'in-review' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Booking Status (Approval)
  app.patch("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });
      const { status } = req.body;
      await pool.query("UPDATE bookings SET status = ? WHERE id = ?", [status, req.params.id]);
      res.json({ status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Expenses Endpoints ────
  app.get("/api/expenses", authenticateToken, async (req: any, res) => {
    try {
      const [expenses] = await pool.query("SELECT * FROM expenses WHERE user_id = ?", [req.user.id]);
      res.json(expenses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/expenses", authenticateToken, async (req: any, res) => {
    try {
      const { trip_id, category, amount, date, description } = req.body;
      const id = nanoid();
      await pool.query(
        "INSERT INTO expenses (id, user_id, trip_id, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, req.user.id, trip_id || null, category, amount, date, description || null]
      );
      res.json({ id, category, amount, date });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/expenses/:id", authenticateToken, async (req: any, res) => {
    try {
      const updates = req.body;
      await pool.query("UPDATE expenses SET ? WHERE id = ? AND user_id = ?", [updates, req.params.id, req.user.id]);
      res.json({ message: "Expense updated" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/expenses/:id", authenticateToken, async (req: any, res) => {
    try {
      await pool.query("DELETE FROM expenses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
      res.json({ message: "Expense deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Travelers Endpoints ────
  app.get("/api/travelers", authenticateToken, async (req: any, res) => {
    try {
      const [travelers] = await pool.query("SELECT * FROM travelers WHERE user_id = ?", [req.user.id]);
      res.json(travelers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/travelers", authenticateToken, async (req: any, res) => {
    try {
      const { name, email, passportNumber, seatPreference, loyaltyNumbers } = req.body;
      const id = nanoid();
      await pool.query(
        "INSERT INTO travelers (id, user_id, name, email, passport_number, seat_preference, loyalty_numbers) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, req.user.id, name, email, passportNumber || null, seatPreference || null, JSON.stringify(loyaltyNumbers || {})]
      );
      res.json({ id, name, email });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/travelers/:id", authenticateToken, async (req: any, res) => {
    try {
        const updates = req.body;
        // In MySQL, we need to handle specific mapping for passportNumber/seatPreference/loyaltyNumbers if different from DB column names
        await pool.query("UPDATE travelers SET ? WHERE id = ? AND user_id = ?", [updates, req.params.id, req.user.id]);
        res.json({ message: "Traveler updated" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/travelers/:id", authenticateToken, async (req: any, res) => {
    try {
      await pool.query("DELETE FROM travelers WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
      res.json({ message: "Traveler deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──── Settings Endpoints ────
  app.get("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      const [settings] = await pool.query("SELECT * FROM user_settings WHERE user_id = ?", [req.user.id]) as any[];
      if (settings.length === 0) {
        // Return defaults if none
        return res.json({ company_name: 'Acme Travel Inc.', currency: 'USD ($)', budget_threshold: 10000 });
      }
      res.json(settings[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/settings", authenticateToken, async (req: any, res) => {
    try {
        const updates = req.body;
        // Upsert logic for settings
        const [existing] = await pool.query("SELECT user_id FROM user_settings WHERE user_id = ?", [req.user.id]) as any[];
        if (existing.length === 0) {
            await pool.query("INSERT INTO user_settings SET ?, user_id = ?", [updates, req.user.id]);
        } else {
            await pool.query("UPDATE user_settings SET ? WHERE user_id = ?", [updates, req.user.id]);
        }
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
    if (_req.url.startsWith('/api')) return; // Don't serve HTML for API errors
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`API endpoints active on /api`);
  });
}

startServer().catch(console.error);

