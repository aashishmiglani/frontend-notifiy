import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";
import BASE_URL from "../config/baseUrl";

export default function ManageContactsModal({ onClose }) {
    const [contacts, setContacts] = useState([]);
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/contacts`);
            setContacts(res.data.data);
        } catch (err) {
            console.error("Error fetching contacts:", err.message);
            toast.error("❌ Failed to load contacts.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newName || !newPhone || newPhone.length !== 10) {
            toast.warning("⚠️ Please enter a valid name and 10-digit phone number.");
            return;
        }

        const formattedPhone = `+91${newPhone.trim()}`;

        setLoading(true);
        try {
            await axios.post(`${BASE_URL}/contacts`, {
                name: newName,
                phone: formattedPhone,
            });
            setNewName("");
            setNewPhone("");
            toast.success("✅ Contact added!");
            await fetchContacts();
        } catch (err) {
            console.error("Add failed:", err.message);
            toast.error("❌ Failed to add contact.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BASE_URL}/contacts/${id}`);
            toast.success("🗑️ Contact deleted.");
            await fetchContacts();
        } catch (err) {
            console.error("Delete failed:", err.message);
            toast.error("❌ Failed to delete contact.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 px-3 py-4">
            <ToastContainer position="top-center" autoClose={2000} />
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl w-full max-w-lg relative overflow-y-auto max-h-[90vh] border border-slate-200">
                
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20 rounded-2xl">
                        <Loader />
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-2xl font-bold"
                    disabled={loading}
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-5 text-center text-slate-800">Manage Contacts</h2>

                {/* Add Contact */}
                <div className="mb-6 space-y-2">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-300 outline-none text-slate-800"
                        disabled={loading}
                    />

                    <div className="flex">
                        <span className="flex items-center px-4 bg-slate-100 border border-slate-300 border-r-0 rounded-l-xl text-slate-600">
                            +91
                        </span>
                        <input
                            type="text"
                            placeholder="Phone"
                            value={newPhone}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "");
                                setNewPhone(digits);
                            }}
                            className="w-full px-4 py-2 border border-slate-300 border-l-0 rounded-r-xl focus:ring-2 focus:ring-teal-300 outline-none text-slate-800"
                            maxLength={10}
                            disabled={loading}
                        />
                    </div>

                    <button
                        onClick={handleAdd}
                        className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition w-full font-semibold"
                        disabled={loading}
                    >
                        Add Contact
                    </button>
                </div>

                {/* Existing Contacts */}
                <h3 className="text-lg font-semibold mb-3 text-slate-700">Existing Contacts</h3>

                <div className="overflow-y-auto max-h-64 border rounded-xl mb-5 p-2 bg-slate-50">
                    {/* Table on desktop */}
                    <table className="w-full text-sm text-left text-slate-700 hidden sm:table">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 font-semibold">Name</th>
                                <th className="p-3 font-semibold">Phone</th>
                                <th className="p-3 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr
                                    key={contact.id}
                                    className="border-t hover:bg-slate-100 transition"
                                >
                                    <td className="p-3">{contact.name}</td>
                                    <td className="p-3">{contact.phone}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => handleDelete(contact.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-3 text-center text-slate-500">
                                        No contacts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Cards on mobile */}
                    <div className="flex flex-col gap-3 sm:hidden">
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center justify-between hover:shadow-md transition"
                            >
                                <div>
                                    <p className="font-medium text-slate-800">{contact.name}</p>
                                    <p className="text-slate-600 text-sm">{contact.phone}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(contact.id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    disabled={loading}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                        {contacts.length === 0 && (
                            <p className="text-center text-slate-500 py-3">No contacts found.</p>
                        )}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition w-full font-semibold"
                    disabled={loading}
                >
                    Done
                </button>
            </div>
        </div>
    );
}
