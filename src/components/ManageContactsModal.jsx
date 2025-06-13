import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManageContactsModal({ onClose }) {
    const [contacts, setContacts] = useState([]);
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await axios.get("https://backend-notification.vercel.app/api/contacts");
            setContacts(res.data.data);
        } catch (err) {
            console.error("Error fetching contacts:", err.message);
            toast.error("❌ Failed to load contacts.");
        }
    };

    const handleAdd = async () => {
        if (!newName || !newPhone || newPhone.length !== 10) {
            toast.warning("⚠️ Please enter a valid name and 10-digit phone number.");
            return;
        }

        const formattedPhone = `+91${newPhone.trim()}`;

        try {
            await axios.post("https://backend-notification.vercel.app/api/contacts", {
                name: newName,
                phone: formattedPhone,
            });
            setNewName("");
            setNewPhone("");
            toast.success("✅ Contact added!");
            fetchContacts();
        } catch (err) {
            console.error("Add failed:", err.message);
            toast.error("❌ Failed to add contact.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://backend-notification.vercel.app/api/contacts/${id}`);
            toast.success("🗑️ Contact deleted.");
            fetchContacts();
        } catch (err) {
            console.error("Delete failed:", err.message);
            toast.error("❌ Failed to delete contact.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95">
            <ToastContainer position="top-center" autoClose={2000} />
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative">
                {/* Close icon */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                >
                    &times;
                </button>

                <h2 className="text-xl font-bold mb-4 text-center">Manage Contacts</h2>

                {/* Add contact form */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full mb-2 p-2 border rounded"
                    />

                    <div className="flex mb-2">
                        <span className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l text-gray-600">
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
                            className="w-full p-2 border border-l-0 rounded-r"
                            maxLength={10}
                        />
                    </div>

                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                    >
                        Add Contact
                    </button>
                </div>

                {/* Contacts table */}
                <h3 className="text-md font-semibold mb-2">Existing Contacts</h3>
                <div className="overflow-y-auto max-h-64 border rounded mb-4">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">Phone</th>
                                <th className="p-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="border-t hover:bg-gray-50">
                                    <td className="p-2">{contact.name}</td>
                                    <td className="p-2">{contact.phone}</td>
                                    <td className="p-2 text-right">
                                        <button
                                            onClick={() => handleDelete(contact.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-2 text-center text-gray-500">
                                        No contacts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Done button */}
                <button
                    onClick={onClose}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                >
                    Done
                </button>
            </div>
        </div>
    );
}
