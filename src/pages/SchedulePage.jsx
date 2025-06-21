import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import "react-datepicker/dist/react-datepicker.css";

export default function SchedulePage() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEvents(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchEvents = async (search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `https://backend-notification.vercel.app/api/schedule/search/${encodeURIComponent(search)}`
        : "https://backend-notification.vercel.app/api/schedule";
      const res = await axios.get(url);
      setEvents(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    setLoading(true);
    try {
      if (editingEventId) {
        await axios.put(`https://backend-notification.vercel.app/api/schedule/${editingEventId}`, {
          event_name: eventName,
          event_date: eventDate,
          event_time: eventTime,
        });
        toast.success("Event updated!");
      } else {
        await axios.post("https://backend-notification.vercel.app/api/schedule", {
          event_name: eventName,
          event_date: eventDate,
          event_time: eventTime,
        });
        toast.success("Event created!");
      }
      await fetchEvents(searchTerm);
      resetForm();
    } catch (error) {
      toast.error("Failed to schedule/update event.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEventName("");
    setEventDate("");
    setEventTime("");
    setEditingEventId(null);
  };

  const handleEdit = (event) => {
    setEventName(event.event_name);
    setEventDate(event.event_date);
    setEventTime(event.event_time);
    setEditingEventId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setLoading(true);
    const previousEvents = [...events];
    setEvents(events.filter(event => event.id !== id));
    try {
      await axios.delete(`https://backend-notification.vercel.app/api/schedule/${id}`);
      toast.info("Event deleted.");
    } catch (error) {
      toast.error("Failed to delete event.");
      setEvents(previousEvents);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 text-gray-800 font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      {loading && (
        <div className="fixed inset-0 bg-white/60 z-50 flex justify-center items-center">
          <div className="w-14 h-14 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-700">📅 Schedule Manager</h1>
          <button
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm sm:text-base"
          >
            {showForm ? "Cancel" : "➕ New Event"}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-100 p-4 sm:p-6 rounded-xl mb-8 border border-gray-200 space-y-4">
            <div>
              <label className="block sm:hidden text-sm font-medium text-gray-600 mb-1">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Event Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block sm:hidden text-sm font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block sm:hidden text-sm font-medium text-gray-600 mb-1">Time</label>
                <TimePicker
                  onChange={setEventTime}
                  value={eventTime}
                  format="hh:mm a"
                  disableClock={true}
                  className="w-full !border !border-gray-300 !rounded-md"
                />
              </div>
            </div>

            <button
              onClick={handleSchedule}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-md font-medium shadow-sm"
            >
              {editingEventId ? "✏️ Update Event" : "✅ Save Event"}
            </button>
          </div>
        )}

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="🔍 Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-300"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ❌
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 w-full">
          <table className="min-w-full text-sm text-center whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border">Event Name</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Day</th>
                <th className="p-3 border">Time</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {events.length > 0 ? (
                events.map((event, index) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 border">{index + 1}</td>
                    <td
                      className="p-3 border text-blue-600 hover:underline cursor-pointer"
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
                    <td className="p-3 border">
                      {new Date(event.event_date).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-3 border">
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </td>
                    <td className="p-3 border">
                      {new Date(`1970-01-01T${event.event_time}`).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="p-3 border space-y-1 sm:space-x-2 sm:space-y-0 flex flex-col sm:flex-row justify-center items-center">
                      <button
                        onClick={() => handleEdit(event)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-gray-400 italic">
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
