import { useState } from "react";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

interface Route {
  id: string;
  from: string;
  to: string;
  duration: string;
  distance: string;
  fare: number;
  departures: string[];
  color: string;
  busId: string;
}

const INITIAL_ROUTES: Route[] = [
  { id: "R001", from: "Main Campus", to: "City Center", duration: "25 min", distance: "8.5 km", fare: 150, departures: ["07:00", "08:30", "10:00"], color: "#10b981", busId: "B001" },
  { id: "R002", from: "Library Block", to: "Sports Complex", duration: "12 min", distance: "3.2 km", fare: 80, departures: ["07:30", "09:00"], color: "#3b82f6", busId: "B002" },
];

export default function RRoutes() {
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);

  const [selected, setSelected] = useState<Route | null>(null);
  const [mode, setMode] = useState<"create" | "edit" | "view" | null>(null);

  const [form, setForm] = useState<any>({});


  function openCreate() {
    setForm({});
    setMode("create");
  }

  function openEdit(route: Route) {
    setSelected(route);
    setForm({
      ...route,
      departures: route.departures.join(","),
    });
    setMode("edit");
  }

  function openView(route: Route) {
    setSelected(route);
    setMode("view");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newRoute: Route = {
      id: mode === "edit" ? selected!.id : `R${Date.now()}`,
      from: form.from,
      to: form.to,
      distance: form.distance,
      duration: form.duration,
      fare: Number(form.fare),
      departures: form.departures.split(",").map((d: string) => d.trim()),
      color: "#10b981",
      busId: "B001",
    };

    if (mode === "edit") {
      setRoutes((prev) =>
        prev.map((r) => (r.id === newRoute.id ? newRoute : r))
      );
    } else {
      setRoutes((prev) => [...prev, newRoute]);
    }

    setMode(null);
  }

  function handleDelete(id: string) {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  }


  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {routes.length} routes configured
        </p>

        <Button onClick={openCreate}>
          <Plus size={16} />
          Add Route
        </Button>
      </div>

      {/* ROUTES */}
      <div className="space-y-4">
        {routes.map((route) => (
          <div key={route.id} className="bg-white border rounded-xl p-5">
            <div className="flex justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">
                  {route.from} → {route.to}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-400 text-xs">Distance</p>
                    <p>{route.distance}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Duration</p>
                    <p>{route.duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Fare</p>
                    <p className="font-bold text-emerald-600">
                      ₦{route.fare}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {route.departures.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-1 text-xs border rounded font-mono"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-2 ml-4">
                <button onClick={() => openView(route)}>
                  <Eye size={16} />
                </button>

                <button onClick={() => openEdit(route)}>
                  <Edit size={16} />
                </button>

                <button onClick={() => handleDelete(route.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {mode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4">

            {/* TITLE */}
            <h2 className="font-bold text-lg">
              {mode === "create" && "Create Route"}
              {mode === "edit" && "Edit Route"}
              {mode === "view" && "View Route"}
            </h2>

            {/* VIEW MODE */}
            {mode === "view" && selected && (
              <div className="space-y-2 text-sm">
                <p><strong>{selected.from} → {selected.to}</strong></p>
                <p>Distance: {selected.distance}</p>
                <p>Duration: {selected.duration}</p>
                <p>Fare: ₦{selected.fare}</p>

                <div className="flex flex-wrap gap-2">
                  {selected.departures.map((d) => (
                    <span key={d} className="text-xs border px-2 py-1 rounded">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(mode === "create" || mode === "edit") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="from" label="From" value={form.from || ""} onChange={handleChange} />
                <Input name="to" label="To" value={form.to || ""} onChange={handleChange} />

                <div className="grid grid-cols-2 gap-3">
                  <Input name="distance" label="Distance" value={form.distance || ""} onChange={handleChange} />
                  <Input name="duration" label="Duration" value={form.duration || ""} onChange={handleChange} />
                </div>

                <Input name="fare" label="Fare" type="number" value={form.fare || ""} onChange={handleChange} />
                <Input name="departures" label="Departures (comma separated)" value={form.departures || ""} onChange={handleChange} />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="w-full">
                    Save
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setMode(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}