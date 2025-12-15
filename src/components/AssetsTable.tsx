"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Asset } from "@/types";
import { editAsset, addAsset } from "@/lib/api";
import * as XLSX from "xlsx";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface AssetsTableProps {
  assets: Asset[];
  onAssetUpdate: () => void;
}

type AddAssetPayload = {
  year_of_purchase: number | null;
  item_name: string;
  quantity: number;
  inventory_number: string;
  room_number: string;
  floor_number: string;
  building_block: string;
  remarks: string;
  department_origin: "own" | "other";
};

const columnHelper = createColumnHelper<Asset>();

export default function AssetsTable({ assets, onAssetUpdate }: AssetsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Filter state
  const [roomFilter, setRoomFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");

  // Unique values for dropdowns
  const uniqueRooms = useMemo(() => Array.from(new Set(assets.map(a => a.room_number).filter(Boolean))), [assets]);
  const uniqueFloors = useMemo(() => Array.from(new Set(assets.map(a => a.floor_number).filter(Boolean))), [assets]);
  const uniqueBuildings = useMemo(() => Array.from(new Set(assets.map(a => a.building_block).filter(Boolean))), [assets]);
  const uniqueYears = useMemo(() => Array.from(new Set(assets.map(a => a.year_of_purchase).filter(Boolean))), [assets]);
  const uniqueOrigins = useMemo(() => Array.from(new Set(assets.map(a => a.department_origin).filter(Boolean))), [assets]);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset =>
      (!roomFilter || asset.room_number === roomFilter) &&
      (!floorFilter || asset.floor_number === floorFilter) &&
      (!buildingFilter || asset.building_block === buildingFilter) &&
      (!yearFilter || String(asset.year_of_purchase) === yearFilter) &&
      (!originFilter || asset.department_origin === originFilter) &&
      (globalFilter === "" ||
        Object.values(asset).some(val =>
          String(val).toLowerCase().includes(globalFilter.toLowerCase())
        ))
    );
  }, [assets, roomFilter, floorFilter, buildingFilter, yearFilter, originFilter, globalFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("item_name", {
        header: "Item Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("inventory_number", {
        header: "Inventory #",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("room_number", {
        header: "Room",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("floor_number", {
        header: "Floor",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("building_block", {
        header: "Building",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("year_of_purchase", {
        header: "Year",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("department_origin", {
        header: "Origin",
        cell: (info) => (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            info.getValue() === "own" 
              ? "bg-green-100 text-green-800" 
              : "bg-blue-100 text-blue-800"
          }`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("remarks", {
        header: "Remarks",
        cell: (info) => (
          <div className="max-w-xs truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <button
            onClick={() => setEditingAsset(info.row.original)}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredAssets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleEditAsset = async (updatedData: Partial<Asset>) => {
    if (!editingAsset) return;
    
    setIsEditing(true);
    try {
      await editAsset(editingAsset.id, updatedData);
      onAssetUpdate();
      setEditingAsset(null);
    } catch (error) {
      console.error("Error updating asset:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddAsset = async (data: AddAssetPayload) => {
    setIsAdding(true);
    try {
      await addAsset(data);
      setShowAddModal(false);
      onAssetUpdate();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add asset";
      alert(message);
    } finally {
      setIsAdding(false);
    }
  };

  const exportToExcel = () => {
    const exportData = assets.map(asset => ({
      "Item Name": asset.item_name,
      "Quantity": asset.quantity,
      "Inventory Number": asset.inventory_number,
      "Room Number": asset.room_number,
      "Floor Number": asset.floor_number,
      "Building Block": asset.building_block,
      "Year of Purchase": asset.year_of_purchase,
      "Department Origin": asset.department_origin,
      "Remarks": asset.remarks,
      "Last Updated": new Date(asset.last_updated).toLocaleDateString(),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Assets");
    XLSX.writeFile(wb, "assets.xlsx");
  };

  return (
    <div className="space-y-4">
      {/* Add Asset Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + Add Asset
        </button>
      </div>
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full bg-gray-800 text-white placeholder-gray-400"
            />
          </div>
          <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="px-2 py-1 border rounded-md">
            <option value="">Room</option>
            {uniqueRooms.map(room => <option key={room} value={room}>{room}</option>)}
          </select>
          <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)} className="px-2 py-1 border rounded-md">
            <option value="">Floor</option>
            {uniqueFloors.map(floor => <option key={floor} value={floor}>{floor}</option>)}
          </select>
          <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)} className="px-2 py-1 border rounded-md">
            <option value="">Building</option>
            {uniqueBuildings.map(building => <option key={building} value={building}>{building}</option>)}
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="px-2 py-1 border rounded-md">
            <option value="">Year</option>
            {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <select value={originFilter} onChange={e => setOriginFilter(e.target.value)} className="px-2 py-1 border rounded-md">
            <option value="">Origin</option>
            {uniqueOrigins.map(origin => <option key={origin} value={origin}>{origin}</option>)}
          </select>
        </div>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingAsset && (
        <EditAssetModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={handleEditAsset}
          isLoading={isEditing}
        />
      )}
      {showAddModal && (
        <AddAssetModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAsset}
          isLoading={isAdding}
        />
      )}
    </div>
  );
}

interface EditAssetModalProps {
  asset: Asset;
  onClose: () => void;
  onSave: (data: Partial<Asset>) => Promise<void>;
  isLoading: boolean;
}

function EditAssetModal({ asset, onClose, onSave, isLoading }: EditAssetModalProps) {
  const [formData, setFormData] = useState({
    quantity: asset.quantity || 0,
    remarks: asset.remarks || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, quantity: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Edit Asset: {asset.item_name}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={handleQuantityChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 

interface AddAssetModalProps {
  onClose: () => void;
  onSave: (data: AddAssetPayload) => Promise<void>;
  isLoading: boolean;
}
function AddAssetModal({ onClose, onSave, isLoading }: AddAssetModalProps) {
  type AddAssetFormState = {
    year_of_purchase: string;
    item_name: string;
    quantity: string;
    inventory_number: string;
    room_number: string;
    floor_number: string;
    building_block: string;
    remarks: string;
    department_origin: "own" | "other";
  };

  const [formData, setFormData] = useState<AddAssetFormState>({
    year_of_purchase: "",
    item_name: "",
    quantity: "",
    inventory_number: "",
    room_number: "",
    floor_number: "",
    building_block: "",
    remarks: "",
    department_origin: "own",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "department_origin") {
        return { ...prev, department_origin: value as "own" | "other" };
      }
      return { ...prev, [name]: value } as AddAssetFormState;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number.parseInt(formData.quantity, 10);
    const year = formData.year_of_purchase ? Number.parseInt(formData.year_of_purchase, 10) : null;
    await onSave({
      ...formData,
      quantity,
      year_of_purchase: Number.isFinite(year as number) ? year : null,
    });
  };
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Asset</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name</label>
              <input name="item_name" value={formData.item_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} required min="1" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Inventory #</label>
              <input name="inventory_number" value={formData.inventory_number} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Room</label>
              <input name="room_number" value={formData.room_number} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Floor</label>
              <input name="floor_number" value={formData.floor_number} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Building</label>
              <input name="building_block" value={formData.building_block} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year of Purchase</label>
              <input name="year_of_purchase" type="number" value={formData.year_of_purchase} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Origin</label>
              <select name="department_origin" value={formData.department_origin} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="own">Own</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50">{isLoading ? "Adding..." : "Add Asset"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 