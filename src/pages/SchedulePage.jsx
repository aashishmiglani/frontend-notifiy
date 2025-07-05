import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormPopup from "../components/FormPopup"; // Adjust path if needed
import BASE_URL from "../config/baseUrl"; // Adjust the path if needed

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
    const timer = setTimeout(() => fetchEvents(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEvents = async (search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `${BASE_URL}/schedule/search/${encodeURIComponent(search)}`
        : `${BASE_URL}/schedule`;
      const res = await axios.get(url);
      setEvents(res.data.data || []);
    } catch {
      toast.error("Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    setLoading(true);
    try {
      if (editingEventId) {
        await axios.put(`${BASE_URL}/schedule/${editingEventId}`, {
          event_name: eventName,
          event_date: eventDate,
          event_time: eventTime,
        });
        toast.success("Event updated!");
      } else {
        await axios.post(`${BASE_URL}/schedule`, {
          event_name: eventName,
          event_date: eventDate,
          event_time: eventTime,
        });
        toast.success("Event created!");
      }
      await fetchEvents(searchTerm);
      resetForm();
    } catch {
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
    const previous = [...events];
    setEvents(events.filter((e) => e.id !== id));
    try {
      await axios.delete(`${BASE_URL}/schedule/${id}`);
      toast.info("Event deleted.");
    } catch {
      setEvents(previous);
      toast.error("Failed to delete event.");
    } finally {
      setLoading(false);
    }
  };

  const onEventClick = (event) => {
    navigate("/contacts", {
      state: {
        eventId: event.id,
        eventName: event.event_name,
        eventDate: event.event_date,
        eventTime: event.event_time,
      },
    });
  };

  const SearchInput = () => (
    <div className="flex w-full items-center bg-[#ededed] rounded-xl h-14 mb-6 px-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 256 256" fill="currentColor" className="text-gray-500 mr-3">
        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
      </svg>
      <input
        type="text"
        placeholder="Search notifications"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex w-full bg-[#ededed] text-[#141414] placeholder:text-gray-500 border-none focus:outline-none"
      />
    </div>
  );

  const renderDesktop = () => (
    <div className="max-w-[960px] mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#0d141c] text-[32px] font-bold">Notifications</p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-full font-medium"
        >
          ➕ New Event
        </button>
      </div>
      <SearchInput />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-[#0d141c] font-semibold">Event Name</th>
              <th className="px-5 py-3 text-[#0d141c] font-semibold">Date</th>
              <th className="px-5 py-3 text-[#0d141c] font-semibold">Time</th>
              <th className="px-5 py-3 text-[#0d141c] font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? events.map((ev) => {
              const date = new Date(ev.event_date).toLocaleDateString("en-GB", {
                year: "numeric", month: "short", day: "numeric"
              });
              const time = new Date(`1970-01-01T${ev.event_time}`).toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", hour12: true
              });
              return (
                <tr key={ev.id} className="border-t hover:bg-slate-100 cursor-pointer" onClick={() => onEventClick(ev)}>
                  <td className="px-5 py-3 text-[#0d141c]">{ev.event_name}</td>
                  <td className="px-5 py-3 text-[#49739c]">{date}</td>
                  <td className="px-5 py-3 text-[#49739c]">{time}</td>
                  <td className="px-5 py-3 space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(ev); }} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-full text-xs">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-xs">Delete</button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="4" className="p-6 text-gray-400 italic text-center">No events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMobile = () => (
    <div className="max-w-[500px] mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#0d141c] text-[24px] font-bold">Notifications</p>
      </div>
      <SearchInput />
      <div className="flex flex-col gap-4 pb-20">
        {events.length > 0 ? events.map((ev) => {
          const date = new Date(ev.event_date).toLocaleDateString("en-GB", {
            year: "numeric", month: "short", day: "numeric"
          });
          const time = new Date(`1970-01-01T${ev.event_time}`).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit", hour12: true
          });
          return (
            <div
              key={ev.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow cursor-pointer"
              onClick={() => onEventClick(ev)}
            >
              <p className="text-lg font-semibold text-[#0d141c] mb-2">{ev.event_name}</p>
              <p className="text-sm text-[#49739c] mb-1">📅 {date}</p>
              <p className="text-sm text-[#49739c] mb-3">⏰ {time}</p>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(ev); }}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-xl text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        }) : (
          <p className="text-gray-400 italic text-center">No events found.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {loading && (
        <div className="fixed inset-0 bg-white/60 z-50 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {showForm && (
        <FormPopup
          onClose={resetForm}
          onSave={handleSchedule}
          eventName={eventName}
          setEventName={setEventName}
          eventDate={eventDate}
          setEventDate={setEventDate}
          eventTime={eventTime}
          setEventTime={setEventTime}
          editingEventId={editingEventId}
        />
      )}

      {/* Desktop */}
      <div className="hidden sm:block">{renderDesktop()}</div>

      {/* Mobile */}
      <div className="block sm:hidden">{renderMobile()}</div>

      {/* Floating "+" button for mobile */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-5 right-5 sm:hidden bg-black hover:bg-gray-900 text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
      >
        +
      </button>
    </div>
  );
}
