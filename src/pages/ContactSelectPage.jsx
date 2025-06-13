import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ManageContactsModal from "../components/ManageContactsModal";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function ContactSelectPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const initialSelectedRef = useRef([]);

    if (!state || !state.eventId || !state.eventName) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center p-10">
                <div>
                    <h2 className="text-xl font-semibold mb-2 text-red-600">Invalid Event Data</h2>
                    <p className="mb-4 text-gray-600">This page requires event details to function properly.</p>
                    <button
                        onClick={() => navigate("/create-event")}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go Back to Event Page
                    </button>
                </div>
            </div>
        );
    }

    useEffect(() => {
        fetchContacts();
    }, [searchQuery, showModal]);

    const fetchContacts = async () => {
        try {
            const contactRes = await axios.get(`https://backend-notification.vercel.app/api/contacts`, {
                params: { search: searchQuery },
            });

            const notifRes = await axios.get(`https://backend-notification.vercel.app/api/notifications`, {
                params: { event_id: state.eventId },
            });

            const selectedForThisEvent = notifRes.data.data.map(n => n.contact_id);

            setContacts(contactRes.data.data);
            setSelectedContacts(selectedForThisEvent);
            initialSelectedRef.current = selectedForThisEvent;
        } catch (err) {
            console.error("Error fetching contacts or notifications:", err.message);
            toast.error("❌ Failed to load contacts.");
        }
    };

    const toggleSelect = (id) => {
        setSelectedContacts((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(contacts.map((c) => c.id));
        }
    };

    const handleSaveSelection = async () => {
        try {
            setIsSending(true);

            // Get current notification records for this event
            const notifRes = await axios.get(`https://backend-notification.vercel.app/api/notifications`, {
                params: { event_id: state.eventId },
            });

            const existingNotifications = notifRes.data.data;

            // Create new notifications
            const toAdd = selectedContacts.filter(
                id => !existingNotifications.some(n => n.contact_id === id)
            ).map(id => ({
                event_id: state.eventId,
                contact_id: id,
            }));

            if (toAdd.length === 1) {
                await axios.post("https://backend-notification.vercel.app/api/notifications", toAdd[0]);
            } else if (toAdd.length > 1) {
                await axios.post("https://backend-notification.vercel.app/api/notifications/bulk", toAdd);
            }

            // Delete removed ones using /notifications/:id
            const toDelete = existingNotifications.filter(
                n => !selectedContacts.includes(n.contact_id)
            );

            for (const record of toDelete) {
                await axios.delete(`https://backend-notification.vercel.app/api/notifications/notifications/${record.id}`);
            }

            toast.success("✅ Selection saved successfully!");
            initialSelectedRef.current = [...selectedContacts];
        } catch (err) {
            console.error("Error saving selection:", err.message);
            toast.error("❌ Failed to save selection.");
        } finally {
            setIsSending(false);
        }
    };

    const handleSend = async () => {
        try {
            setIsSending(true);
            await axios.post("https://backend-notification.vercel.app/api/send-message", {
                event_id: state.eventId,
                contact_ids: selectedContacts,
            });
            toast.success("✅ Notifications sent successfully!");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            console.error("Error sending notifications:", err.message);
            toast.error("❌ Something went wrong while sending messages.");
        } finally {
            setIsSending(false);
        }
    };

    const handleClearSearch = () => setSearchQuery("");

    const handleSendClick = async () => {
        try {
            const notifRes = await axios.get(`https://backend-notification.vercel.app/api/notifications`, {
                params: { event_id: state.eventId },
            });

            const savedSelected = notifRes.data.data.map(n => n.contact_id);
            setSelectedContacts(savedSelected);
            setShowConfirmation(true);
        } catch (err) {
            console.error("Failed to fetch saved contacts for confirmation:", err.message);
            toast.error("❌ Could not fetch saved contacts.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl">
                <button
                    onClick={() => navigate("/")}
                    className="mb-4 text-blue-600 hover:underline"
                >
                    &larr; Back to Home
                </button>

                <div className="border border-blue-300 rounded-xl p-4 mb-6 bg-blue-50">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                        Event: {state.eventName}
                    </h2>
                    <p className="text-gray-600">
                        Date: {state.eventDate} | Time: {state.eventTime}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                    <div className="relative w-full sm:w-1/2">
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 pr-10 border rounded"
                        />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 text-lg"
                            >
                                &times;
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Manage Contacts
                    </button>
                </div>

                <div className="overflow-x-auto border rounded-lg shadow-sm mb-4">
                    <table className="min-w-full bg-white text-sm text-gray-700">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="p-3">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4"
                                    />
                                </th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="border-t hover:bg-gray-50 transition">
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedContacts.includes(contact.id)}
                                            onChange={() => toggleSelect(contact.id)}
                                            className="w-4 h-4"
                                        />
                                    </td>
                                    <td className="p-3 font-medium">{contact.name}</td>
                                    <td className="p-3">{contact.phone}</td>
                                </tr>
                            ))}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-3 text-center text-gray-500">
                                        No contacts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleSaveSelection}
                        disabled={isSending}
                        className="w-full sm:w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSending ? "Saving..." : "💾 Save Selection"}
                    </button>

                    <button
                        onClick={handleSendClick}
                        disabled={isSending}
                        className="w-full sm:w-1/2 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSending ? "Sending..." : "📤 Send Notifications"}
                    </button>
                </div>
            </div>

            {showModal && (
                <ManageContactsModal onClose={() => setShowModal(false)} />
            )}

            {showConfirmation && (
                <NotificationConfirmationModal
                    contacts={contacts}
                    selectedIds={selectedContacts}
                    onConfirm={() => {
                        setShowConfirmation(false);
                        handleSend();
                    }}
                    onCancel={() => setShowConfirmation(false)}
                />
            )}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
}

function NotificationConfirmationModal({ contacts, selectedIds, onConfirm, onCancel }) {
    const selected = contacts.filter(c => selectedIds.includes(c.id));
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Notification</h2>
                <p className="mb-3 text-gray-600">
                    You're about to send notifications to the following contacts:
                </p>
                <ul className="max-h-40 overflow-y-auto text-sm mb-4 border rounded p-2">
                    {selected.map((c) => (
                        <li key={c.id}>
                            ✅ {c.name} ({c.phone})
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                    >
                        Confirm & Send
                    </button>
                </div>
            </div>
        </div>
    );
}
