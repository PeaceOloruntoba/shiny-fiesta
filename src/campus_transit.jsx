import { useState, useCallback } from "react";
import {
  Bus, MapPin, Clock, Users, ChevronRight, Home, Ticket, User,
  BarChart2, Search, LogOut, Menu, QrCode, Shield, TrendingUp,
  Plus, Edit, Trash2, Calendar, CheckCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const BUSES = [
  { id: "B001", name: "Green Eagle I",    plate: "PHC-001-KW", capacity: 32, model: "Toyota Coaster",   year: 2022, status: "active" },
  { id: "B002", name: "Blue Hawk II",     plate: "PHC-002-KW", capacity: 24, model: "Mitsubishi Rosa",  year: 2021, status: "active" },
  { id: "B003", name: "Gold Falcon III",  plate: "PHC-003-KW", capacity: 32, model: "Toyota Coaster",   year: 2023, status: "active" },
  { id: "B004", name: "Purple Condor IV", plate: "PHC-004-KW", capacity: 16, model: "Ford Transit",     year: 2022, status: "maintenance" },
];

const ROUTES = [
  { id: "R001", from: "Main Campus",    to: "City Center",       duration: "25 min", distance: "8.5 km", fare: 150, departures: ["07:00","08:30","10:00","12:00","14:00","16:30","18:00"], color: "#10b981", busId: "B001" },
  { id: "R002", from: "Library Block",  to: "Sports Complex",    duration: "12 min", distance: "3.2 km", fare: 80,  departures: ["07:30","09:00","11:00","13:00","15:30","17:00"],         color: "#3b82f6", busId: "B002" },
  { id: "R003", from: "Student Hostel", to: "Faculty of Science",duration: "18 min", distance: "5.1 km", fare: 100, departures: ["06:30","08:00","10:30","13:30","16:00","18:30"],         color: "#f59e0b", busId: "B003" },
  { id: "R004", from: "Technology Hub", to: "Admin Block",       duration: "8 min",  distance: "2.1 km", fare: 60,  departures: ["08:00","10:00","12:30","15:00","17:30"],                 color: "#8b5cf6", busId: "B004" },
];

const BOOKINGS_INITIAL = [
  { id: "TKT-001", userId: "STU001", routeId: "R001", departure: "08:30", date: "2026-04-03", seats: [5, 6], status: "confirmed", fare: 300,  timestamp: "2026-04-02T14:30:00" },
  { id: "TKT-002", userId: "STU001", routeId: "R002", departure: "09:00", date: "2026-04-04", seats: [12],   status: "confirmed", fare: 80,   timestamp: "2026-04-03T08:00:00" },
  { id: "TKT-003", userId: "STU002", routeId: "R003", departure: "10:30", date: "2026-04-03", seats: [3],    status: "used",      fare: 100,  timestamp: "2026-04-01T09:00:00" },
  { id: "TKT-004", userId: "STU003", routeId: "R001", departure: "14:00", date: "2026-04-05", seats: [8],    status: "cancelled", fare: 150,  timestamp: "2026-04-02T11:00:00" },
  { id: "TKT-005", userId: "STU004", routeId: "R004", departure: "15:00", date: "2026-04-03", seats: [2, 4], status: "confirmed", fare: 120,  timestamp: "2026-04-03T07:30:00" },
  { id: "TKT-006", userId: "STU005", routeId: "R002", departure: "11:00", date: "2026-04-03", seats: [7],    status: "used",      fare: 80,   timestamp: "2026-04-03T10:30:00" },
];

const WEEKLY_STATS = [
  { day: "Mon", bookings: 42, revenue: 5800 }, { day: "Tue", bookings: 38, revenue: 5100 },
  { day: "Wed", bookings: 55, revenue: 7200 }, { day: "Thu", bookings: 61, revenue: 8400 },
  { day: "Fri", bookings: 78, revenue: 10200 },{ day: "Sat", bookings: 29, revenue: 3900 },
  { day: "Sun", bookings: 18, revenue: 2400 },
];

const ROUTE_PIE = [
  { name: "R001", value: 38, color: "#10b981" }, { name: "R002", value: 24, color: "#3b82f6" },
  { name: "R003", value: 22, color: "#f59e0b" }, { name: "R004", value: 16, color: "#8b5cf6" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const genSeats = (busId, seed = 0) => {
  const bus = BUSES.find(b => b.id === busId);
  const cap = bus?.capacity ?? 32;
  const booked = new Set();
  let h = seed + busId.charCodeAt(busId.length - 1) * 31;
  while (booked.size < Math.floor(cap * 0.45)) { h = (h * 1103515245 + 12345) & 0x7fffffff; booked.add((h % cap) + 1); }
  return Array.from({ length: cap }, (_, i) => ({ id: i + 1, booked: booked.has(i + 1) }));
};

const genQR = (n) => {
  const g = Array.from({ length: 11 }, (_, r) => Array.from({ length: 11 }, (_, c) => {
    if ((r < 3 && c < 3) || (r < 3 && c > 7) || (r > 7 && c < 3)) return true;
    return ((n * 31 + r * 7 + c * 13) % 17) < 8;
  }));
  return g;
};

const statusCfg = {
  confirmed: { bg: "#f0fdf4", color: "#10b981", label: "Confirmed" },
  used:      { bg: "#eff6ff", color: "#3b82f6", label: "Used" },
  cancelled: { bg: "#fef2f2", color: "#ef4444", label: "Cancelled" },
};

const nextDep = (deps) => {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  for (const d of deps) { const [h, m] = d.split(":").map(Number); if (h * 60 + m > cur) return d; }
  return deps[0] + "↻";
};

// ─── TOAST ───────────────────────────────────────────────────────────────────

function Toasts({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", zIndex:9999, display:"flex", flexDirection:"column", gap:8, alignItems:"center", pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type==="success"?"#10b981":t.type==="error"?"#ef4444":"#1e293b", color:"white", padding:"10px 20px", borderRadius:12, fontSize:14, fontWeight:600, whiteSpace:"nowrap" }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function AppSafe() {
  const [view, setView]       = useState("login");
  const [user, setUser]       = useState(null);
  const [toasts, setToasts]   = useState([]);
  const [bookings, setBookings] = useState(BOOKINGS_INITIAL);

  const toast = useCallback((msg, type = "default") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message: msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  const login = (role) => {
    setUser(role === "admin"
      ? { id: "ADM001", name: "Dr. Amara Obi",  role: "admin",   email: "admin@uniph.edu.ng" }
      : { id: "STU001", name: "Chidi Nwosu",    role: "student", email: "chidi@uniph.edu.ng", matric: "CSC/2021/042" });
    setView(role === "admin" ? "admin" : "mobile");
    toast(`Welcome back! Signed in as ${role}`, "success");
  };

  const addBooking      = (b) => setBookings(p => [b, ...p]);
  const updateBooking   = (id, status) => setBookings(p => p.map(b => b.id === id ? {...b, status} : b));

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", minHeight:"100vh", background:"#f1f5f9" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing:border-box; } button:focus { outline:none; } input:focus { outline:none; }`}</style>
      <Toasts toasts={toasts} />
      {view === "login"  && <LoginScreen  onLogin={login} />}
      {view === "mobile" && <MobileApp   user={user} allBookings={bookings} onLogout={() => { setUser(null); setView("login"); }} onBook={addBooking} toast={toast} />}
      {view === "admin"  && <AdminApp    user={user} bookings={bookings}    onLogout={() => { setUser(null); setView("login"); }} toast={toast}    onUpdate={updateBooking} />}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, background:"linear-gradient(160deg,#0f172a 0%,#064e3b 100%)" }}>
      <div style={{ textAlign:"center", marginBottom:52 }}>
        <div style={{ width:80, height:80, background:"#10b981", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          <Bus size={38} color="white" />
        </div>
        <h1 style={{ fontFamily:"'Space Mono',monospace", fontSize:28, fontWeight:700, color:"white", margin:0, letterSpacing:2 }}>CAMPUSTRANSIT</h1>
        <p style={{ color:"#6ee7b7", fontSize:14, marginTop:8, margin:"8px 0 0" }}>University of Port Harcourt</p>
      </div>

      <div style={{ width:"100%", maxWidth:380, display:"flex", flexDirection:"column", gap:14 }}>
        {[
          { role:"student", icon:<User size={22}/>,   title:"Student Login",    sub:"Book seats & manage tickets",  bg:"#10b981",             border:"transparent" },
          { role:"admin",   icon:<Shield size={22}/>, title:"Admin Dashboard",  sub:"Manage routes & operations",   bg:"rgba(255,255,255,.08)", border:"rgba(255,255,255,.18)" },
        ].map(({ role, icon, title, sub, bg, border }) => (
          <button key={role} onClick={() => onLogin(role)}
            style={{ background:bg, border:`1px solid ${border}`, borderRadius:16, padding:"18px 22px", fontSize:16, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", color:"white", transition:"opacity .2s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {icon}
              <div style={{ textAlign:"left" }}>
                <div>{title}</div>
                <div style={{ fontSize:12, opacity:.7, fontWeight:400, marginTop:2 }}>{sub}</div>
              </div>
            </div>
            <ChevronRight size={20} />
          </button>
        ))}
      </div>
      <p style={{ color:"rgba(255,255,255,.25)", fontSize:12, marginTop:44 }}>© 2026 UNIPH Transport Services</p>
    </div>
  );
}

// ─── MOBILE SHELL ─────────────────────────────────────────────────────────────

function MobileApp({ user, allBookings, onLogout, onBook, toast }) {
  const [tab, setTab]                 = useState("home");
  const [selectedRoute, setRoute]     = useState(null);
  const [selectedTicket, setTicket]   = useState(null);
  const myBookings = allBookings.filter(b => b.userId === user?.id);
  const activeCnt  = myBookings.filter(b => b.status === "confirmed").length;

  const goHome = () => { setTab("home"); setRoute(null); setTicket(null); };

  return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:"#f8fafc", display:"flex", flexDirection:"column", position:"relative" }}>
      {/* Header */}
      <div style={{ background:"#0f172a", padding:"52px 20px 22px", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ color:"#64748b", fontSize:13, margin:0 }}>Good morning,</p>
            <h2 style={{ color:"white", fontSize:20, fontWeight:800, margin:"3px 0 0" }}>{user?.name?.split(" ")[0]} 👋</h2>
          </div>
          <div style={{ width:42, height:42, borderRadius:14, background:"#10b981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"white", fontWeight:800 }}>
            {user?.name?.[0]}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:88 }}>
        {tab === "home" && !selectedRoute && <HomeScreen routes={ROUTES} onSelect={setRoute} />}
        {tab === "home" && selectedRoute   && <SeatPicker route={selectedRoute} user={user} onBack={() => setRoute(null)} onBook={b => { onBook(b); setRoute(null); setTab("tickets"); toast("Booking confirmed! 🎉","success"); }} toast={toast} />}
        {tab === "tickets" && !selectedTicket && <TicketsScreen bookings={myBookings} onSelect={setTicket} />}
        {tab === "tickets" && selectedTicket  && <TicketDetail ticket={selectedTicket} route={ROUTES.find(r => r.id === selectedTicket.routeId)} onBack={() => setTicket(null)} />}
        {tab === "profile" && <ProfileScreen user={user} bookings={myBookings} onLogout={onLogout} />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"white", borderTop:"1px solid #e2e8f0", padding:"8px 0 18px", zIndex:20 }}>
        <div style={{ display:"flex", justifyContent:"space-around" }}>
          {[
            { id:"home",    icon:Home,   label:"Routes" },
            { id:"tickets", icon:Ticket, label:"Tickets", badge: activeCnt },
            { id:"profile", icon:User,   label:"Profile" },
          ].map(({ id, icon: Icon, label, badge }) => (
            <button key={id} onClick={() => { setTab(id); setRoute(null); setTicket(null); }}
              style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 20px", position:"relative" }}>
              <div style={{ position:"relative" }}>
                <Icon size={22} color={tab===id?"#10b981":"#94a3b8"} />
                {badge > 0 && <div style={{ position:"absolute", top:-5, right:-7, background:"#ef4444", color:"white", fontSize:9, fontWeight:800, width:15, height:15, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{badge}</div>}
              </div>
              <span style={{ fontSize:11, color:tab===id?"#10b981":"#94a3b8", fontWeight:tab===id?700:400 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

function HomeScreen({ routes, onSelect }) {
  const [q, setQ] = useState("");
  const filtered = routes.filter(r =>
    r.from.toLowerCase().includes(q.toLowerCase()) ||
    r.to.toLowerCase().includes(q.toLowerCase()) ||
    r.id.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ padding:20 }}>
      {/* Search */}
      <div style={{ background:"white", borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:22, border:"1px solid #e2e8f0" }}>
        <Search size={17} color="#94a3b8" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search routes…"
          style={{ border:"none", flex:1, fontSize:15, color:"#0f172a", background:"transparent" }} />
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        <div style={{ background:"linear-gradient(135deg,#10b981,#059669)", borderRadius:18, padding:18, color:"white" }}>
          <Bus size={20} />
          <div style={{ fontSize:30, fontWeight:800, margin:"8px 0 2px" }}>{routes.length}</div>
          <div style={{ fontSize:12, opacity:.8 }}>Active Routes</div>
        </div>
        <div style={{ background:"linear-gradient(135deg,#3b82f6,#1d4ed8)", borderRadius:18, padding:18, color:"white" }}>
          <Clock size={20} />
          <div style={{ fontSize:22, fontWeight:800, margin:"8px 0 2px", fontFamily:"'Space Mono',monospace" }}>{nextDep(routes[0].departures)}</div>
          <div style={{ fontSize:12, opacity:.8 }}>Next Departure</div>
        </div>
      </div>

      <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 14px" }}>Available Routes</h3>
      {filtered.map(r => <RouteCard key={r.id} route={r} onSelect={() => onSelect(r)} />)}
    </div>
  );
}

function RouteCard({ route, onSelect }) {
  const seats = genSeats(route.busId);
  const avail = seats.filter(s => !s.booked).length;
  return (
    <div onClick={onSelect} style={{ background:"white", borderRadius:20, padding:20, marginBottom:14, cursor:"pointer", border:"1px solid #e2e8f0" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:route.color }} />
            <span style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:"#94a3b8" }}>{route.id}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
            <MapPin size={14} color="#10b981" />
            <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{route.from}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <MapPin size={14} color="#ef4444" />
            <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{route.to}</span>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:24, fontWeight:800, color:"#10b981" }}>₦{route.fare}</div>
          <div style={{ fontSize:11, color:"#94a3b8" }}>per seat</div>
        </div>
      </div>
      <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}><Clock size={13} color="#94a3b8"/><span style={{ fontSize:12, color:"#64748b" }}>{route.duration}</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}><Users size={13} color="#94a3b8"/><span style={{ fontSize:12, color:"#64748b" }}>{avail} free</span></div>
        </div>
        <div style={{ background:"#f0fdf4", borderRadius:8, padding:"4px 10px" }}>
          <span style={{ fontSize:12, color:"#10b981", fontWeight:700, fontFamily:"'Space Mono',monospace" }}>Next {nextDep(route.departures)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── SEAT PICKER ──────────────────────────────────────────────────────────────

function SeatPicker({ route, user, onBack, onBook, toast }) {
  const [seats]       = useState(() => genSeats(route.busId, 42));
  const [selected, setSelected] = useState([]);
  const [dep, setDep] = useState(route.departures[0]);
  const bus = BUSES.find(b => b.id === route.busId);

  const toggle = (s) => {
    if (s.booked) return;
    if (selected.includes(s.id)) { setSelected(p => p.filter(x => x !== s.id)); return; }
    if (selected.length >= 4) { toast("Max 4 seats per booking","error"); return; }
    setSelected(p => [...p, s.id]);
  };

  const book = () => {
    if (!selected.length) { toast("Please select a seat","error"); return; }
    onBook({ id:`TKT-${Date.now()}`, userId:user.id, routeId:route.id, departure:dep, date:new Date().toISOString().split("T")[0], seats:selected, status:"confirmed", fare:route.fare*selected.length, timestamp:new Date().toISOString() });
  };

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <button onClick={onBack} style={{ background:"#f1f5f9", border:"none", borderRadius:10, width:38, height:38, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ChevronRight size={18} color="#64748b" style={{ transform:"rotate(180deg)" }} />
        </button>
        <div>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0f172a" }}>Select Seats</h3>
          <p style={{ margin:0, fontSize:12, color:"#64748b" }}>{route.from} → {route.to}</p>
        </div>
      </div>

      {/* Departures */}
      <div style={{ marginBottom:20 }}>
        <p style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:10, textTransform:"uppercase", letterSpacing:.5 }}>Departure Time</p>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {route.departures.map(d => (
            <button key={d} onClick={() => setDep(d)}
              style={{ padding:"8px 14px", borderRadius:10, border:`2px solid ${dep===d?"#10b981":"#e2e8f0"}`, background:dep===d?"#f0fdf4":"white", color:dep===d?"#10b981":"#64748b", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Space Mono',monospace" }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Bus seat map */}
      <div style={{ background:"white", borderRadius:20, padding:20, border:"1px solid #e2e8f0", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{bus?.name}</span>
          <span style={{ fontSize:11, color:"#94a3b8", fontFamily:"'Space Mono',monospace" }}>{bus?.plate}</span>
        </div>
        <div style={{ background:"#f8fafc", borderRadius:10, padding:"8px 12px", textAlign:"center", marginBottom:14, fontSize:11, color:"#94a3b8", border:"1px dashed #e2e8f0" }}>
          🚌 Driver — Front of Bus
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:6 }}>
          {seats.map(s => (
            <button key={s.id} onClick={() => toggle(s)}
              title={`Seat ${s.id}`}
              style={{ aspectRatio:"1", borderRadius:8, border:"none", cursor:s.booked?"not-allowed":"pointer",
                background:s.booked?"#f1f5f9":selected.includes(s.id)?"#10b981":"#dcfce7",
                color:s.booked?"#cbd5e1":selected.includes(s.id)?"white":"#10b981",
                fontSize:10, fontWeight:800, transition:"all .12s", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {s.id}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:14, justifyContent:"center" }}>
          {[["#dcfce7","#10b981","Available"],["#10b981","white","Selected"],["#f1f5f9","#cbd5e1","Booked"]].map(([bg,c,l]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:14, height:14, borderRadius:4, background:bg, border:`1.5px solid ${c}` }} />
              <span style={{ fontSize:11, color:"#64748b" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div style={{ background:"#0f172a", borderRadius:20, padding:22, color:"white" }}>
          {[["Seats", selected.sort((a,b)=>a-b).join(", ")],["Departure", dep],["Total Fare",`₦${route.fare*selected.length}`]].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom: k==="Total Fare"?20:10 }}>
              <span style={{ color:"#94a3b8", fontSize:13 }}>{k}</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize: k==="Total Fare"?22:14, fontWeight:800, color: k==="Total Fare"?"#10b981":"white" }}>{v}</span>
            </div>
          ))}
          <button onClick={book} style={{ width:"100%", background:"#10b981", border:"none", borderRadius:14, padding:"16px", color:"white", fontSize:16, fontWeight:800, cursor:"pointer" }}>
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}

// ─── TICKETS ──────────────────────────────────────────────────────────────────

function TicketsScreen({ bookings, onSelect }) {
  return (
    <div style={{ padding:20 }}>
      <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>My Tickets</h3>
      <p style={{ fontSize:13, color:"#64748b", margin:"0 0 20px" }}>{bookings.length} bookings</p>
      {!bookings.length && (
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <Ticket size={48} color="#e2e8f0" />
          <p style={{ color:"#94a3b8", fontSize:15, marginTop:16 }}>No tickets yet</p>
        </div>
      )}
      {bookings.map(b => {
        const route = ROUTES.find(r => r.id === b.routeId);
        const sc = statusCfg[b.status] || { bg:"#f8fafc", color:"#64748b", label:b.status };
        return (
          <div key={b.id} onClick={() => onSelect(b)}
            style={{ background:"white", borderRadius:20, padding:20, marginBottom:14, cursor:"pointer", border:"1px solid #e2e8f0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#94a3b8", marginBottom:4 }}>{b.id}</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{route?.from} → {route?.to}</div>
              </div>
              <span style={{ background:sc.bg, color:sc.color, fontSize:11, fontWeight:800, padding:"4px 10px", borderRadius:8 }}>{sc.label}</span>
            </div>
            <div style={{ display:"flex", gap:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}><Calendar size={13} color="#94a3b8"/><span style={{ fontSize:12, color:"#64748b" }}>{b.date}</span></div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}><Clock size={13} color="#94a3b8"/><span style={{ fontSize:12, color:"#64748b" }}>{b.departure}</span></div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}><Users size={13} color="#94a3b8"/><span style={{ fontSize:12, color:"#64748b" }}>{b.seats.length} seat(s)</span></div>
            </div>
            <div style={{ borderTop:"1px solid #f1f5f9", marginTop:12, paddingTop:12, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:"#94a3b8" }}>Total paid</span>
              <span style={{ fontSize:17, fontWeight:800, color:"#10b981" }}>₦{b.fare}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TicketDetail({ ticket, route, onBack }) {
  const qr    = genQR(parseInt(ticket.id.replace(/\D/g,"")) || 1234);
  const bus   = BUSES.find(b => b.id === route?.busId);
  const sc    = statusCfg[ticket.status] || { bg:"#f8fafc", color:"#64748b", label:ticket.status };
  const CELL  = 21;

  return (
    <div style={{ padding:20 }}>
      <button onClick={onBack} style={{ background:"#f1f5f9", border:"none", borderRadius:10, width:38, height:38, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
        <ChevronRight size={18} color="#64748b" style={{ transform:"rotate(180deg)" }} />
      </button>
      <div style={{ background:"white", borderRadius:24, padding:24, border:"1px solid #e2e8f0" }}>
        <div style={{ background:"#0f172a", borderRadius:18, padding:20, marginBottom:24, textAlign:"center", color:"white" }}>
          <Bus size={28} style={{ marginBottom:8 }} />
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:18, fontWeight:700 }}>{ticket.id}</div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>{route?.from} → {route?.to}</div>
        </div>

        {/* QR */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
          <div style={{ padding:14, background:"white", borderRadius:16, border:`3px solid ${sc.color}` }}>
            <div style={{ display:"grid", gridTemplateColumns:`repeat(11,${CELL}px)`, gap:2 }}>
              {qr.flat().map((on, i) => <div key={i} style={{ width:CELL, height:CELL, background:on?"#0f172a":"white", borderRadius:2 }} />)}
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          {[["Date",ticket.date],["Departure",ticket.departure],["Seats",ticket.seats.join(", ")],["Fare",`₦${ticket.fare}`],["Status",ticket.status.toUpperCase()],["Bus",bus?.name||"—"]].map(([k,v]) => (
            <div key={k} style={{ background:"#f8fafc", borderRadius:12, padding:"12px 14px" }}>
              <div style={{ fontSize:11, color:"#94a3b8", marginBottom:4 }}>{k}</div>
              <div style={{ fontSize:13, fontWeight:800, color: k==="Status"?sc.color:"#0f172a", fontFamily:["Seats","Fare","Departure"].includes(k)?"'Space Mono',monospace":"inherit" }}>{v}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:"#94a3b8", textAlign:"center", margin:0 }}>Present QR to driver when boarding</p>
      </div>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

function ProfileScreen({ user, bookings, onLogout }) {
  const spent = bookings.filter(b => b.status !== "cancelled").reduce((s,b) => s+b.fare, 0);
  return (
    <div style={{ padding:20 }}>
      <div style={{ background:"white", borderRadius:20, padding:26, marginBottom:16, textAlign:"center", border:"1px solid #e2e8f0" }}>
        <div style={{ width:72, height:72, borderRadius:22, background:"#10b981", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:30, color:"white", fontWeight:800 }}>
          {user?.name?.[0]}
        </div>
        <h2 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{user?.name}</h2>
        <p style={{ color:"#64748b", fontSize:13, margin:"0 0 4px" }}>{user?.email}</p>
        {user?.matric && <p style={{ fontFamily:"'Space Mono',monospace", color:"#94a3b8", fontSize:12, margin:0 }}>{user?.matric}</p>}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
        {[["Trips",bookings.filter(b=>b.status==="used").length,"#3b82f6"],["Active",bookings.filter(b=>b.status==="confirmed").length,"#10b981"],["Spent",`₦${spent}`,"#f59e0b"]].map(([l,v,c]) => (
          <div key={l} style={{ background:"white", borderRadius:16, padding:"16px 12px", textAlign:"center", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:20, fontWeight:800, color:c }}>{v}</div>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>

      <button onClick={onLogout} style={{ width:"100%", background:"#fef2f2", border:"none", borderRadius:14, padding:16, color:"#ef4444", fontSize:15, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}

// ─── ADMIN SHELL ──────────────────────────────────────────────────────────────

function AdminApp({ user, bookings, onLogout, toast, onUpdate }) {
  const [section, setSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const nav = [
    { id:"dashboard", label:"Dashboard", icon:BarChart2 },
    { id:"routes",    label:"Routes",    icon:MapPin },
    { id:"fleet",     label:"Fleet",     icon:Bus },
    { id:"bookings",  label:"Bookings",  icon:Ticket },
    { id:"scanner",   label:"Scanner",   icon:QrCode },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      {/* Sidebar */}
      <div style={{ width:collapsed?68:230, background:"#0f172a", display:"flex", flexDirection:"column", flexShrink:0, transition:"width .25s" }}>
        <div style={{ padding:collapsed?"22px 14px":"22px 18px", borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, background:"#10b981", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Bus size={20} color="white" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily:"'Space Mono',monospace", color:"white", fontSize:12, fontWeight:700, letterSpacing:1 }}>CAMPUSTRANSIT</div>
              <div style={{ color:"#64748b", fontSize:11 }}>Admin Panel</div>
            </div>
          )}
        </div>

        <nav style={{ flex:1, padding:"14px 8px" }}>
          {nav.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:collapsed?"12px 14px":"12px 14px", borderRadius:12, border:"none", cursor:"pointer", marginBottom:4, background:section===id?"#10b981":"transparent", color:section===id?"white":"#64748b", justifyContent:collapsed?"center":"flex-start", transition:"all .15s" }}>
              <Icon size={19} />
              {!collapsed && <span style={{ fontSize:14, fontWeight:section===id?700:400 }}>{label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding:"14px 8px", borderTop:"1px solid #1e293b" }}>
          {!collapsed && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", marginBottom:8 }}>
              <div style={{ width:32, height:32, background:"#10b981", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"white", fontWeight:800 }}>{user?.name?.[0]}</div>
              <div>
                <div style={{ color:"white", fontSize:13, fontWeight:700 }}>{user?.name?.split(" ")[0]}</div>
                <div style={{ color:"#64748b", fontSize:11 }}>Administrator</div>
              </div>
            </div>
          )}
          <button onClick={onLogout}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:collapsed?"10px 14px":"10px 14px", borderRadius:10, border:"none", cursor:"pointer", background:"transparent", color:"#64748b", justifyContent:collapsed?"center":"flex-start" }}>
            <LogOut size={17} />
            {!collapsed && <span style={{ fontSize:14 }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:"auto", background:"#f8fafc" }}>
        <div style={{ background:"white", padding:"16px 24px", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:10 }}>
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Menu size={17} color="#64748b" />
          </button>
          <h1 style={{ flex:1, fontSize:18, fontWeight:800, color:"#0f172a", margin:0 }}>
            {nav.find(n => n.id === section)?.label}
          </h1>
          <span style={{ fontSize:13, color:"#94a3b8" }}>
            {new Date().toLocaleDateString("en-NG",{ weekday:"long", day:"numeric", month:"long", year:"numeric" })}
          </span>
        </div>
        <div style={{ padding:24 }}>
          {section === "dashboard" && <AdminDashboard bookings={bookings} />}
          {section === "routes"    && <AdminRoutes    routes={ROUTES}     toast={toast} />}
          {section === "fleet"     && <AdminFleet     buses={BUSES}       toast={toast} />}
          {section === "bookings"  && <AdminBookings  bookings={bookings} onUpdate={onUpdate} toast={toast} />}
          {section === "scanner"   && <AdminScanner   bookings={bookings} onUpdate={onUpdate} toast={toast} />}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

function AdminDashboard({ bookings }) {
  const total   = bookings.filter(b=>b.status!=="cancelled").reduce((s,b)=>s+b.fare,0);
  const active  = bookings.filter(b=>b.status==="confirmed").length;
  const used    = bookings.filter(b=>b.status==="used").length;

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {[
          { label:"Total Revenue",    value:`₦${total.toLocaleString()}`, icon:TrendingUp, color:"#10b981", bg:"#f0fdf4" },
          { label:"Active Bookings",  value:active,   icon:Ticket,  color:"#3b82f6", bg:"#eff6ff" },
          { label:"Trips Completed",  value:used,     icon:CheckCircle, color:"#f59e0b", bg:"#fffbeb" },
          { label:"Routes Operating", value:ROUTES.length, icon:MapPin, color:"#8b5cf6", bg:"#f5f3ff" },
        ].map(({ label, value, icon:Icon, color, bg }) => (
          <div key={label} style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <p style={{ fontSize:12, color:"#64748b", margin:"0 0 8px" }}>{label}</p>
                <p style={{ fontSize:26, fontWeight:800, color:"#0f172a", margin:0 }}>{value}</p>
              </div>
              <div style={{ background:bg, width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon size={22} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:22 }}>
        <div style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 18px" }}>Weekly Bookings</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={WEEKLY_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:10, border:"1px solid #e2e8f0", fontSize:12 }} />
              <Bar dataKey="bookings" fill="#10b981" radius={[6,6,0,0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 18px" }}>Route Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={ROUTE_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                {ROUTE_PIE.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v=>`${v}%`} contentStyle={{ borderRadius:10, border:"1px solid #e2e8f0", fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginTop:8 }}>
            {ROUTE_PIE.map(r => (
              <div key={r.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:r.color }} />
                <span style={{ fontSize:11, color:"#64748b" }}>{r.name} {r.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings table */}
      <div style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0" }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 14px" }}>Recent Bookings</h3>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Ticket","Route","Date","Dep","Fare","Status"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 12px", fontSize:11, color:"#94a3b8", fontWeight:700, borderBottom:"1px solid #f1f5f9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0,6).map(b => {
              const rt = ROUTES.find(r=>r.id===b.routeId);
              const sc = statusCfg[b.status]||{bg:"#f8fafc",color:"#64748b"};
              return (
                <tr key={b.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                  <td style={{ padding:"11px 12px", fontFamily:"'Space Mono',monospace", fontSize:12, color:"#64748b" }}>{b.id}</td>
                  <td style={{ padding:"11px 12px", fontSize:13, color:"#0f172a" }}>{rt?.from?.split(" ")[0]} → {rt?.to?.split(" ")[0]}</td>
                  <td style={{ padding:"11px 12px", fontSize:12, color:"#64748b" }}>{b.date}</td>
                  <td style={{ padding:"11px 12px", fontSize:12, fontFamily:"'Space Mono',monospace", color:"#64748b" }}>{b.departure}</td>
                  <td style={{ padding:"11px 12px", fontSize:14, fontWeight:800, color:"#10b981" }}>₦{b.fare}</td>
                  <td style={{ padding:"11px 12px" }}>
                    <span style={{ background:sc.bg, color:sc.color, fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:7 }}>{b.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

function AdminRoutes({ routes, toast }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <p style={{ margin:0, color:"#64748b", fontSize:14 }}>{routes.length} routes configured</p>
        <button onClick={() => toast("Route editor opened","default")}
          style={{ background:"#10b981", border:"none", borderRadius:10, padding:"10px 18px", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <Plus size={15}/> Add Route
        </button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {routes.map(r => {
          const bus = BUSES.find(b=>b.id===r.busId);
          return (
            <div key={r.id} style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:r.color }} />
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:"#94a3b8" }}>{r.id}</span>
                    <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{r.from} → {r.to}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:14 }}>
                    {[["Distance",r.distance],["Duration",r.duration],["Fare",`₦${r.fare}`],["Bus",bus?.name||"—"]].map(([k,v]) => (
                      <div key={k}>
                        <div style={{ fontSize:11, color:"#94a3b8", marginBottom:3 }}>{k}</div>
                        <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", fontFamily:k==="Fare"?"'Space Mono',monospace":"inherit" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginBottom:6 }}>Schedules</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {r.departures.map(d => (
                        <span key={d} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:6, padding:"3px 9px", fontSize:12, fontFamily:"'Space Mono',monospace", color:"#475569" }}>{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginLeft:16 }}>
                  <button onClick={() => toast(`Editing ${r.id}`,"default")} style={{ background:"#eff6ff", border:"none", borderRadius:8, width:34, height:34, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Edit size={14} color="#3b82f6"/></button>
                  <button onClick={() => toast("Confirm before deleting","error")} style={{ background:"#fef2f2", border:"none", borderRadius:8, width:34, height:34, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Trash2 size={14} color="#ef4444"/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ADMIN FLEET ──────────────────────────────────────────────────────────────

function AdminFleet({ buses, toast }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <p style={{ margin:0, color:"#64748b", fontSize:14 }}>{buses.length} vehicles in fleet</p>
        <button onClick={() => toast("Fleet editor opened","default")}
          style={{ background:"#10b981", border:"none", borderRadius:10, padding:"10px 18px", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <Plus size={15}/> Add Vehicle
        </button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
        {buses.map(bus => {
          const active = bus.status === "active";
          return (
            <div key={bus.id} style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ width:50, height:50, background:active?"#f0fdf4":"#fffbeb", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Bus size={26} color={active?"#10b981":"#f59e0b"} />
                </div>
                <span style={{ background:active?"#f0fdf4":"#fffbeb", color:active?"#10b981":"#f59e0b", fontSize:12, fontWeight:800, padding:"5px 12px", borderRadius:8, height:"fit-content" }}>
                  {active?"Active":"Maintenance"}
                </span>
              </div>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 3px" }}>{bus.name}</h3>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:"#94a3b8", margin:"0 0 14px" }}>{bus.plate}</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                {[["Model",bus.model],["Year",bus.year],["Capacity",`${bus.capacity} seats`],["ID",bus.id]].map(([k,v]) => (
                  <div key={k}><div style={{ fontSize:11, color:"#94a3b8" }}>{k}</div><div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{v}</div></div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => toast(`Viewing ${bus.name}`,"default")} style={{ flex:1, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px", color:"#475569", fontSize:13, cursor:"pointer", fontWeight:600 }}>Details</button>
                <button onClick={() => toast(`Editing ${bus.name}`,"default")} style={{ flex:1, background:"#eff6ff", border:"none", borderRadius:8, padding:"8px", color:"#3b82f6", fontSize:13, cursor:"pointer", fontWeight:600 }}>Edit</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ADMIN BOOKINGS ───────────────────────────────────────────────────────────

function AdminBookings({ bookings, onUpdate, toast }) {
  const [filter, setFilter] = useState("all");
  const rows = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
        {["all","confirmed","used","cancelled"].map(f => {
          const cnt = f==="all"?bookings.length:bookings.filter(b=>b.status===f).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:"8px 16px", borderRadius:10, border:`1.5px solid ${filter===f?"#10b981":"#e2e8f0"}`, background:filter===f?"#f0fdf4":"white", color:filter===f?"#10b981":"#64748b", fontSize:13, fontWeight:700, cursor:"pointer", textTransform:"capitalize" }}>
              {f} ({cnt})
            </button>
          );
        })}
      </div>
      <div style={{ background:"white", borderRadius:16, border:"1px solid #e2e8f0", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f8fafc" }}>
              {["Ticket","User","Route","Date & Time","Seats","Fare","Status","Actions"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"12px 14px", fontSize:11, color:"#94a3b8", fontWeight:700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(b => {
              const rt = ROUTES.find(r=>r.id===b.routeId);
              const sc = statusCfg[b.status]||{bg:"#f8fafc",color:"#64748b"};
              return (
                <tr key={b.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                  <td style={{ padding:"12px 14px", fontFamily:"'Space Mono',monospace", fontSize:11, color:"#64748b" }}>{b.id}</td>
                  <td style={{ padding:"12px 14px", fontSize:13, fontWeight:700, color:"#0f172a" }}>{b.userId}</td>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#475569" }}>{rt?.from?.split(" ")[0]} → {rt?.to?.split(" ")[0]}</td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:"#64748b", fontFamily:"'Space Mono',monospace" }}>{b.date} {b.departure}</td>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#475569" }}>{b.seats.join(", ")}</td>
                  <td style={{ padding:"12px 14px", fontSize:14, fontWeight:800, color:"#10b981" }}>₦{b.fare}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{ background:sc.bg, color:sc.color, fontSize:11, fontWeight:800, padding:"3px 9px", borderRadius:7 }}>{b.status}</span>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      {b.status==="confirmed" && (
                        <>
                          <button onClick={() => { onUpdate(b.id,"used"); toast(`${b.id} marked used`,"success"); }}
                            style={{ background:"#f0fdf4", border:"none", borderRadius:6, padding:"5px 10px", fontSize:11, color:"#10b981", cursor:"pointer", fontWeight:700 }}>
                            Used
                          </button>
                          <button onClick={() => { onUpdate(b.id,"cancelled"); toast(`${b.id} cancelled`,"error"); }}
                            style={{ background:"#fef2f2", border:"none", borderRadius:6, padding:"5px 10px", fontSize:11, color:"#ef4444", cursor:"pointer", fontWeight:700 }}>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN SCANNER ────────────────────────────────────────────────────────────

function AdminScanner({ bookings, onUpdate, toast }) {
  const [input,    setInput]   = useState("");
  const [result,   setResult]  = useState(null);
  const [scanning, setScanning]= useState(false);

  const scan = () => {
    const id = input.trim().toUpperCase();
    if (!id) { toast("Enter a ticket ID","error"); return; }
    setScanning(true); setResult(null);
    setTimeout(() => {
      const b = bookings.find(x => x.id === id);
      setResult(b || "not_found");
      setScanning(false);
      if (!b) toast(`Ticket ${id} not found`,"error");
    }, 1100);
  };

  const validate = () => {
    if (result && result !== "not_found" && result.status === "confirmed") {
      onUpdate(result.id, "used");
      setResult({ ...result, status:"used" });
      toast(`✓ Ticket ${result.id} validated!`, "success");
    }
  };

  const sc  = result && result !== "not_found" ? (statusCfg[result.status]||{}) : null;

  return (
    <div style={{ maxWidth:480, margin:"0 auto" }}>
      <div style={{ background:"white", borderRadius:20, padding:24, border:"1px solid #e2e8f0", marginBottom:20 }}>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ width:64, height:64, background:"#f0fdf4", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
            <QrCode size={30} color="#10b981" />
          </div>
          <h3 style={{ fontSize:18, fontWeight:800, margin:"0 0 4px", color:"#0f172a" }}>Ticket Scanner</h3>
          <p style={{ color:"#64748b", fontSize:13, margin:0 }}>Scan QR or enter ticket ID to validate</p>
        </div>

        {/* Simulated viewfinder */}
        <div style={{ background:"#0f172a", borderRadius:16, height:180, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ border:"2px solid #10b981", width:120, height:120, borderRadius:12, position:"relative" }}>
            {["tl","tr","bl","br"].map(c => (
              <div key={c} style={{ position:"absolute", width:18, height:18,
                borderTop: c.startsWith("t")?"3px solid #10b981":"none",
                borderBottom: c.startsWith("b")?"3px solid #10b981":"none",
                borderLeft:  c.endsWith("l")?"3px solid #10b981":"none",
                borderRight: c.endsWith("r")?"3px solid #10b981":"none",
                top:    c.startsWith("t")?-2:undefined, bottom: c.startsWith("b")?-2:undefined,
                left:   c.endsWith("l")  ?-2:undefined, right:  c.endsWith("r")  ?-2:undefined,
              }} />
            ))}
          </div>
          <div style={{ position:"absolute", bottom:12, fontSize:12, color:"#10b981", opacity:.7 }}>
            {scanning ? "Scanning…" : "Align QR code in frame"}
          </div>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&scan()}
            placeholder="Enter ticket ID (e.g. TKT-001)"
            style={{ flex:1, border:"1.5px solid #e2e8f0", borderRadius:12, padding:"12px 16px", fontSize:14, fontFamily:"'Space Mono',monospace" }} />
          <button onClick={scan}
            style={{ background:"#10b981", border:"none", borderRadius:12, padding:"12px 22px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
            {scanning?"…":"Scan"}
          </button>
        </div>
        <p style={{ fontSize:12, color:"#94a3b8", textAlign:"center", marginTop:10, margin:"10px 0 0" }}>
          Try: TKT-001, TKT-002, TKT-003, TKT-005
        </p>
      </div>

      {result === "not_found" && (
        <div style={{ background:"#fef2f2", borderRadius:16, padding:20, textAlign:"center", border:"2px solid #ef4444" }}>
          <p style={{ color:"#ef4444", fontWeight:800, fontSize:16, margin:0 }}>Ticket Not Found</p>
          <p style={{ color:"#ef4444", opacity:.7, fontSize:13, margin:"8px 0 0" }}>No ticket matches "{input}"</p>
        </div>
      )}

      {result && result !== "not_found" && (
        <div style={{ background:"white", borderRadius:20, padding:22, border:`2px solid ${sc.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:15, fontWeight:800, color:"#0f172a" }}>{result.id}</div>
              <div style={{ fontSize:12, color:"#64748b" }}>{ROUTES.find(r=>r.id===result.routeId)?.from} → {ROUTES.find(r=>r.id===result.routeId)?.to}</div>
            </div>
            <div style={{ background:sc.bg, color:sc.color, fontSize:15, fontWeight:800, padding:"8px 16px", borderRadius:12 }}>
              {result.status==="confirmed"?"✓ VALID":result.status==="used"?"USED":"CANCELLED"}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
            {[["Date",result.date],["Departure",result.departure],["Seats",result.seats.join(", ")],["Fare",`₦${result.fare}`]].map(([k,v]) => (
              <div key={k} style={{ background:"#f8fafc", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:11, color:"#94a3b8" }}>{k}</div>
                <div style={{ fontSize:14, fontWeight:800, color:"#0f172a" }}>{v}</div>
              </div>
            ))}
          </div>
          {result.status==="confirmed" && (
            <button onClick={validate} style={{ width:"100%", background:"#10b981", border:"none", borderRadius:12, padding:16, color:"white", fontSize:16, fontWeight:800, cursor:"pointer" }}>
              ✓ Validate &amp; Allow Boarding
            </button>
          )}
          {result.status==="used" && (
            <div style={{ background:"#eff6ff", borderRadius:12, padding:16, textAlign:"center", color:"#3b82f6", fontWeight:800 }}>Already used — deny boarding</div>
          )}
          {result.status==="cancelled" && (
            <div style={{ background:"#fef2f2", borderRadius:12, padding:16, textAlign:"center", color:"#ef4444", fontWeight:800 }}>Cancelled ticket — deny boarding</div>
          )}
        </div>
      )}
    </div>
  );
}
