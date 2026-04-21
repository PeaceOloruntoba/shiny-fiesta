import { useState, useEffect } from "react";
import {
  Bus as BusIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  Hash,
  Type,
  Calendar,
  Settings,
} from "lucide-react";
import { useFleet, type Bus } from "../stores/fleet";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { X } from "lucide-react";

export default function Fleet() {
  const { buses, loading, fetchBuses, addBus, updateBus, deleteBus } =
    useFleet();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [busToDelete, setBusToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Bus, "id">>({
    name: "",
    plate_number: "",
    capacity: 32,
    model: "",
    year: new Date().getFullYear(),
    status: "active",
  });

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const filteredBuses = buses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.plate_number.toLowerCase().includes(search.toLowerCase()) ||
      b.model.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenModal = (bus?: Bus) => {
    if (bus) {
      setSelectedBus(bus);
      setFormData({
        name: bus.name,
        plate_number: bus.plate_number,
        capacity: bus.capacity,
        model: bus.model,
        year: bus.year,
        status: bus.status,
      });
    } else {
      setSelectedBus(null);
      setFormData({
        name: "",
        plate_number: "",
        capacity: 32,
        model: "",
        year: new Date().getFullYear(),
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsConfirmOpen(true);
  };

  const confirmSave = async () => {
    if (selectedBus) {
      await updateBus(selectedBus.id, formData);
    } else {
      await addBus(formData);
    }
    setIsConfirmOpen(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setBusToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (busToDelete) {
      await deleteBus(busToDelete);
      setBusToDelete(null);
    }
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Fleet Management</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {buses.length} active vehicles in network
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary" className="h-10 px-6 text-xs font-bold uppercase tracking-widest">
          <Plus size={18} />
          Add Vehicle
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <Input
          placeholder="Search by name, plate number, or model..."
          leftIcon={<Search size={16} className="text-gray-400" />}
          value={search}
          className="border-none bg-transparent h-10 text-sm"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBuses.map((bus) => {
          const isActive = bus.status === "active";
          return (
            <div
              key={bus.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                >
                  <BusIcon size={24} />
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                >
                  {bus.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {bus.name}
              </h3>
              <p className="font-mono text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest">
                {bus.plate_number}
              </p>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Model</p>
                  <p className="text-xs font-bold text-gray-700 truncate">{bus.model}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Year</p>
                  <p className="text-xs font-bold text-gray-700">{bus.year}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Capacity</p>
                  <p className="text-xs font-bold text-gray-700">{bus.capacity} Seats</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle ID</p>
                  <p className="text-[10px] font-mono font-bold text-gray-400 truncate">#{bus.id.slice(0, 8)}</p>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  onClick={() => handleOpenModal(bus)}
                  variant="secondary"
                  className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest"
                >
                  <Edit size={14} />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(bus.id)}
                  variant="danger"
                  className="h-9 w-9 p-0"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[500px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-[#101828] mb-6">
              {selectedBus ? "Edit Vehicle" : "Add New Vehicle"}
            </h3>

            <div className="space-y-4">
              <Input
                label="Vehicle Name"
                placeholder="e.g. Green Eagle I"
                leftIcon={<Type size={18} />}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Plate Number"
                placeholder="PHC-000-KW"
                leftIcon={<Hash size={18} />}
                value={formData.plate_number}
                onChange={(e) =>
                  setFormData({ ...formData, plate_number: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Model"
                  placeholder="Toyota Coaster"
                  leftIcon={<Settings size={18} />}
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                />
                <Input
                  label="Year"
                  type="number"
                  leftIcon={<Calendar size={18} />}
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Capacity"
                  type="number"
                  leftIcon={<BusIcon size={18} />}
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#4CAF50] text-sm font-medium"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
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
                {selectedBus ? "Update Vehicle" : "Add Vehicle"}
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
        title={selectedBus ? "Update Vehicle?" : "Add Vehicle?"}
        description={`Are you sure you want to ${selectedBus ? "update" : "add"} this vehicle to the fleet?`}
        confirmText={selectedBus ? "Yes, Update" : "Yes, Add"}
        variant="proceed"
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Vehicle?"
        description="This action cannot be undone. Are you sure you want to delete this vehicle from the fleet?"
        confirmText="Yes, Delete"
        variant="danger"
        isLoading={loading}
      />
    </div>
  );
}
