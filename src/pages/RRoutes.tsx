import { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  Navigation,
  CreditCard,
  X,
} from "lucide-react";
import { useRoutes, type Route } from "../stores/routes";
import { useFleet } from "../stores/fleet";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ConfirmationModal from "../components/ui/ConfirmationModal";

export default function RRoutes() {
  const { routes, loading, fetchRoutes, addRoute, updateRoute, deleteRoute } =
    useRoutes();
  const { buses, fetchBuses } = useFleet();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Route, "id">>({
    origin: "",
    destination: "",
    duration: "",
    distance: "",
    fare: 0,
    departures: [],
    color: "#10b981",
    bus_id: "",
  });

  const [newDeparture, setNewDeparture] = useState("");

  useEffect(() => {
    fetchRoutes();
    fetchBuses();
  }, [fetchRoutes, fetchBuses]);

  const filteredRoutes = routes.filter(
    (r) =>
      r.origin.toLowerCase().includes(search.toLowerCase()) ||
      r.destination.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenModal = (route?: Route) => {
    if (route) {
      setSelectedRoute(route);
      setFormData({
        origin: route.origin,
        destination: route.destination,
        duration: route.duration,
        distance: route.distance,
        fare: route.fare,
        departures: route.departures,
        color: route.color,
        bus_id: route.bus_id,
      });
    } else {
      setSelectedRoute(null);
      setFormData({
        origin: "",
        destination: "",
        duration: "",
        distance: "",
        fare: 0,
        departures: [],
        color: "#10b981",
        bus_id: buses[0]?.id || "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsConfirmOpen(true);
  };

  const confirmSave = async () => {
    if (selectedRoute) {
      await updateRoute(selectedRoute.id, formData);
    } else {
      await addRoute(formData);
    }
    setIsConfirmOpen(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setRouteToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (routeToDelete) {
      await deleteRoute(routeToDelete);
      setRouteToDelete(null);
    }
    setIsDeleteConfirmOpen(false);
  };

  const addDeparture = () => {
    if (newDeparture && !formData.departures.includes(newDeparture)) {
      setFormData({
        ...formData,
        departures: [...formData.departures, newDeparture].sort(),
      });
      setNewDeparture("");
    }
  };

  const removeDeparture = (time: string) => {
    setFormData({
      ...formData,
      departures: formData.departures.filter((t) => t !== time),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Route Management</h2>
          <p className="text-sm text-gray-500">
            {routes.length} routes configured
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus size={18} />
          Add Route
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <Input
          placeholder="Search by origin, destination, or route ID..."
          leftIcon={<Search size={18} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRoutes.map((route) => {
          const bus = buses.find((b) => b.id === route.bus_id);
          return (
            <div
              key={route.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: route.color }}
                    />
                    <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">
                      {route.id}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {route.origin} → {route.destination}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Distance
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {route.distance}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {route.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Fare
                      </p>
                      <p className="text-sm font-bold text-emerald-600">
                        ₦{route.fare}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Assigned Bus
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {bus?.name || "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                      Daily Schedules
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {route.departures.map((time) => (
                        <span
                          key={time}
                          className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-mono text-gray-600"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 justify-end">
                  <Button
                    onClick={() => handleOpenModal(route)}
                    variant="secondary"
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(route.id)}
                    variant="danger"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[600px] shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-[#101828] mb-6">
              {selectedRoute ? "Edit Route" : "Add New Route"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="From (Origin)"
                  placeholder="e.g. Main Campus"
                  leftIcon={<MapPin size={18} className="text-green-500" />}
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                />
                <Input
                  label="To (Destination)"
                  placeholder="e.g. City Center"
                  leftIcon={<MapPin size={18} className="text-red-500" />}
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Distance"
                  placeholder="e.g. 8.5 km"
                  leftIcon={<Navigation size={18} />}
                  value={formData.distance}
                  onChange={(e) =>
                    setFormData({ ...formData, distance: e.target.value })
                  }
                />
                <Input
                  label="Duration"
                  placeholder="e.g. 25 min"
                  leftIcon={<Clock size={18} />}
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fare (₦)"
                  type="number"
                  leftIcon={<CreditCard size={18} />}
                  value={formData.fare}
                  onChange={(e) =>
                    setFormData({ ...formData, fare: parseInt(e.target.value) })
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Assign Bus
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#4CAF50] text-sm font-medium"
                    value={formData.bus_id}
                    onChange={(e) =>
                      setFormData({ ...formData, bus_id: e.target.value })
                    }
                  >
                    <option value="">Select a bus</option>
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.plate_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Departures
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="time"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#4CAF50] text-sm font-mono"
                    value={newDeparture}
                    onChange={(e) => setNewDeparture(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    onClick={addDeparture}
                    type="button"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.departures.map((time) => (
                    <span
                      key={time}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-mono border border-green-100"
                    >
                      {time}
                      <button
                        onClick={() => removeDeparture(time)}
                        className="text-green-400 hover:text-green-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Route Color
                </label>
                <div className="flex gap-3">
                  {[
                    "#10b981",
                    "#3b82f6",
                    "#f59e0b",
                    "#8b5cf6",
                    "#ef4444",
                    "#064e3b",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex-1"
                isLoading={loading}
              >
                {selectedRoute ? "Update Route" : "Create Route"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmSave}
        title={selectedRoute ? "Update Route?" : "Create Route?"}
        description={`Are you sure you want to ${selectedRoute ? "update" : "create"} this route?`}
        confirmText={selectedRoute ? "Yes, Update" : "Yes, Create"}
        variant="proceed"
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Route?"
        description="This action cannot be undone. All schedules for this route will be removed."
        confirmText="Yes, Delete"
        variant="danger"
        isLoading={loading}
      />
    </div>
  );
}
