import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SchedulePage() {
    const [eventName, setEventName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchEvents(searchTerm);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const fetchEvents = async (search = "") => {
        try {
            const url = search
                ? `https://backend-notification.vercel.app/api/schedule/search/${encodeURIComponent(search)}`
                : "https://backend-notification.vercel.app/api/schedule";

            const res = await axios.get(url);
            setEvents(res.data.data || []);
        } catch (error) {
            console.error("❌ Failed to fetch events:", error);
            toast.error("Failed to fetch events.");
        }
    };

    const handleSchedule = async () => {
        try {
            await axios.post("https://backend-notification.vercel.app/api/schedule", {
                event_name: eventName,
                event_date: eventDate,
                event_time: eventTime,
            });

            setShowForm(false);
            setEventName("");
            setEventDate("");
            setEventTime("");
            fetchEvents();
            toast.success("✅ Event created successfully!");
        } catch (error) {
            console.error("❌ Failed to schedule event:", error);
            toast.error("❌ Failed to schedule event.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await axios.delete(`https://backend-notification.vercel.app/api/schedule/${id}`);
            fetchEvents(searchTerm);
            toast.info("🗑️ Event deleted.");
        } catch (error) {
            console.error("❌ Delete failed:", error);
            toast.error("Failed to delete event.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-blue-700">📅 Events</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {showForm ? "Cancel" : "➕ Create Event"}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <input
                            type="text"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="Event Name"
                            className="w-full mb-2 p-2 border border-gray-300 rounded"
                        />
                        <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full mb-2 p-2 border border-gray-300 rounded"
                        />
                        <input
                            type="time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                        />
                        <button
                            onClick={handleSchedule}
                            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
                        >
                            Save & Continue
                        </button>
                    </div>
                )}

                {/* Search Input */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="🔍 Search event by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded pr-10"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label="Clear search"
                        >
                            ❌
                        </button>
                    )}
                </div>

                {/* Event Table */}
                <table className="w-full table-auto border">
                    <thead>
                        <tr className="bg-gray-200 text-center">
                            <th className="p-2 border">S.No</th>
                            <th className="p-2 border">Event Name</th>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Time</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length > 0 ? (
                            events.map((event, index) => (
                                <tr key={event.id} className="text-center hover:bg-gray-50">
                                    <td className="border p-2">{index + 1}</td>
                                    <td
                                        className="border p-2 cursor-pointer text-blue-600 hover:underline"
                                        onClick={() =>
                                            navigate("/contacts", {
                                                state: {
                                                    eventId: event.id,
                                                    eventName: event.event_name,
                                                    eventDate: event.event_date,
                                                    eventTime: event.event_time,
                                                },
                                            })
                                        }
                                    >
                                        {event.event_name}
                                    </td>
                                    <td className="border p-2">{event.event_date}</td>
                                    <td className="border p-2">{event.event_time}</td>
                                    <td className="border p-2">
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center p-4 text-gray-500">
                                    No events found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
