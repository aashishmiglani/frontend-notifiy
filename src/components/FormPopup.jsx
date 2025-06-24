import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

export default function FormPopup({
  onClose,
  onSave,
  eventName,
  setEventName,
  eventDate,
  setEventDate,
  eventTime,
  setEventTime,
  editingEventId
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold"
        >
          &times;
        </button>
        <p className="text-lg font-bold mb-4">
          {editingEventId ? "✏️ Edit Event" : "➕ Create Event"}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-[#141414] font-medium mb-1">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter event name"
              className="w-full h-12 bg-[#ededed] text-[#141414] placeholder:text-neutral-500 rounded-xl px-4"
            />
          </div>
          <div>
            <label className="block text-[#141414] font-medium mb-1">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full h-12 bg-[#ededed] text-[#141414] rounded-xl px-4"
            />
          </div>
          <div>
            <label className="block text-[#141414] font-medium mb-1">Time</label>
            <TimePicker
              onChange={setEventTime}
              value={eventTime}
              disableClock
              className="w-full h-12 bg-[#ededed] text-[#141414] rounded-xl px-4"
            />
          </div>
          <button
            onClick={onSave}
            className="w-full bg-black hover:bg-gray-900 text-white h-12 rounded-full font-bold"
          >
            {editingEventId ? "Update Event" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
