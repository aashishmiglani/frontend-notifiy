// ContactSelectPage.jsx

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ManageContactsModal from "../components/ManageContactsModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ContactSelectPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [hasSavedSelection, setHasSavedSelection] = useState(false);
    const initialSelectedRef = useRef([]);

    if (!state || !state.eventId || !state.eventName) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center p-10">
                <div>
                    <h2 className="text-xl font-semibold mb-2 text-red-600">Invalid Event Data</h2>
                    <p className="mb-4 text-slate-600">This page requires event details to function properly.</p>
                    <button
                        onClick={() => navigate("/create-event")}
                        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
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
            setIsLoadingContacts(true);
            const contactRes = await axios.get(`https://backend-notification.vercel.app/api/contacts`, {
                params: { search: searchQuery },
            });
            const allContacts = contactRes.data.data;

            const notifRes = await axios.get(`https://backend-notification.vercel.app/api/notifications`, {
                params: { event_id: state.eventId },
            });
            const existingNotifs = notifRes.data.data;

            const selectedForThisEvent = allContacts
                .filter(contact =>
                    existingNotifs.some(notif => notif.contact_id === contact.id && notif.event_id === state.eventId)
                )
                .map(contact => contact.id);

            setContacts(allContacts);
            setSelectedContacts(selectedForThisEvent);
            initialSelectedRef.current = selectedForThisEvent;
            setHasSavedSelection(selectedForThisEvent.length > 0);
        } catch (err) {
            console.error("Error fetching contacts or notifications:", err.message);
            toast.error("❌ Failed to load contacts or notifications.");
        } finally {
            setIsLoadingContacts(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedContacts(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

    const toggleSelectAll = () => {
        setSelectedContacts(isAllSelected ? [] : contacts.map(c => c.id));
    };

    const handleSaveSelection = async () => {
        try {
            setIsSending(true);

            const notifRes = await axios.get(`https://backend-notification.vercel.app/api/notifications`, {
                params: { event_id: state.eventId },
            });
            const existingNotifications = notifRes.data.data;

            const toAdd = selectedContacts.filter(id =>
                !existingNotifications.some(n => n.contact_id === id && n.event_id === state.eventId)
            ).map(id => ({
                event_id: state.eventId,
                contact_id: id,
            }));

            if (toAdd.length === 1) {
                await axios.post(`https://backend-notification.vercel.app/api/notifications`, toAdd[0]);
            } else if (toAdd.length > 1) {
                await axios.post(`https://backend-notification.vercel.app/api/notifications/bulk`, toAdd);
            }

            const toDelete = existingNotifications.filter(
                n => n.event_id === state.eventId && !selectedContacts.includes(n.contact_id)
            );

            for (const record of toDelete) {
                await axios.delete(`https://backend-notification.vercel.app/api/notifications/notifications/${record.id}`);
            }

            toast.success("✅ Selection saved successfully!");
            initialSelectedRef.current = [...selectedContacts];
            setHasSavedSelection(selectedContacts.length > 0);
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
            await axios.post(`https://backend-notification.vercel.app/api/send-message`, {
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

    const handleSendClick = async () => {
        try {
            const notifRes = await axios.get(`https://backend-notification.vercel.app/api/notifications`, {
                params: { event_id: state.eventId },
            });
            const savedSelected = notifRes.data.data
                .filter(n => n.event_id === state.eventId)
                .map(n => n.contact_id);

            setSelectedContacts(savedSelected);
            setHasSavedSelection(savedSelected.length > 0);
            setShowConfirmation(true);
        } catch (err) {
            console.error("Failed to fetch saved contacts for confirmation:", err.message);
            toast.error("❌ Could not fetch saved contacts.");
        }
    };

  return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 flex justify-center">
            <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg">
                <button 
                    onClick={() => navigate("/")} 
                    className="text-teal-600 hover:text-teal-800 mb-4 flex items-center space-x-1 text-base font-medium"
                >
                    <span className="text-xl">←</span>
                    <span>Back to Home</span>
                </button>

                <div className="border border-teal-300 bg-teal-50 rounded-xl p-5 mb-6">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-1">📅 Event: {state.eventName}</h2>
                    <p className="text-slate-600">Date: {state.eventDate} | Time: {state.eventTime} | ID: {state.eventId}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                    <input
                        type="text"
                        placeholder="🔍 Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-grow border border-slate-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-teal-300 outline-none text-slate-800"
                    />
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-teal-600 text-white px-5 py-2 rounded-xl hover:bg-teal-700 transition"
                    >
                        ➕ Manage Contacts
                    </button>
                </div>

                <div className="overflow-x-auto border rounded-lg shadow mb-5">
                    <table className="min-w-full text-sm text-left text-slate-700">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3">
                                    <input 
                                        type="checkbox" 
                                        checked={isAllSelected} 
                                        onChange={toggleSelectAll} 
                                    />
                                </th>
                                <th className="p-3 font-semibold text-slate-700">Name</th>
                                <th className="p-3 font-semibold text-slate-700">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingContacts ? (
                                <tr>
                                    <td colSpan="3" className="p-4 text-center">Loading...</td>
                                </tr>
                            ) : contacts.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-4 text-center text-slate-500">No contacts found.</td>
                                </tr>
                            ) : (
                                contacts.map((contact) => (
                                    <tr key={contact.id} className="border-t hover:bg-slate-100 transition">
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedContacts.includes(contact.id)}
                                                onChange={() => toggleSelect(contact.id)}
                                            />
                                        </td>
                                        <td className="p-3">{contact.name}</td>
                                        <td className="p-3">{contact.phone}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleSaveSelection}
                        disabled={isSending}
                        className="w-full sm:w-1/2 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 disabled:opacity-50"
                    >
                        💾 Save Selection
                    </button>
                    <button
                        onClick={handleSendClick}
                        disabled={isSending || !hasSavedSelection}
                        className="w-full sm:w-1/2 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                    >
                        📤 Send Notifications
                    </button>
                </div>
            </div>

            {showModal && <ManageContactsModal onClose={() => setShowModal(false)} />}

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

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

function NotificationConfirmationModal({ contacts, selectedIds, onConfirm, onCancel }) {
    const selected = contacts.filter((c) => selectedIds.includes(c.id));
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">Confirm Notification</h2>
                <p className="mb-3 text-slate-600">You are about to send notifications to:</p>
                <ul className="max-h-40 overflow-y-auto text-sm mb-4 border rounded p-2 space-y-1">
                    {selected.map((c) => (
                        <li key={c.id} className="flex items-center space-x-2">
                            <span>✅</span>
                            <span>{c.name} ({c.phone})</span>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onCancel} 
                        className="px-4 py-2 rounded-xl bg-slate-300 hover:bg-slate-400 text-slate-800"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        Confirm & Send
                    </button>
                </div>
            </div>
        </div>
    );
}