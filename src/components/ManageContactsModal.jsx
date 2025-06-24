import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader"; // Adjust path if needed

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
            const res = await axios.get("https://backend-notification.vercel.app/api/contacts");
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
            await axios.post("https://backend-notification.vercel.app/api/contacts", {
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
            await axios.delete(`https://backend-notification.vercel.app/api/contacts/${id}`);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95">
            <ToastContainer position="top-center" autoClose={2000} />
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg relative">
                
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20 rounded-2xl">
                        <Loader />
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-slate-500 hover:text-slate-800 text-xl"
                    disabled={loading}
                >
                    &times;
                </button>

                <h2 className="text-xl font-bold mb-4 text-center text-slate-800">➕ Manage Contacts</h2>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full mb-2 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-300 outline-none text-slate-800"
                        disabled={loading}
                    />

                    <div className="flex mb-2">
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
                        className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition w-full"
                        disabled={loading}
                    >
                        💾 Add Contact
                    </button>
                </div>

                <h3 className="text-md font-semibold mb-3 text-slate-700">📋 Existing Contacts</h3>
                <div className="overflow-y-auto max-h-64 border rounded-xl mb-5">
                    <table className="w-full text-sm text-left text-slate-700">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 font-semibold">Name</th>
                                <th className="p-3 font-semibold">Phone</th>
                                <th className="p-3 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="border-t hover:bg-slate-50 transition">
                                    <td className="p-3">{contact.name}</td>
                                    <td className="p-3">{contact.phone}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => handleDelete(contact.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
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
                </div>

                <button
                    onClick={onClose}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition w-full"
                    disabled={loading}
                >
                    Done
                </button>
            </div>
        </div>
    );
}
