import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
export default function App() {
  const [name, setName] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSchedule = async () => {
    if (!eventDate || !eventTime) {
      alert("Please fill both date and time");
      return;
    }

    const combinedDateTime = new Date(`${eventDate}T${eventTime}`);
    const isoString = combinedDateTime.toISOString();

    // Send to backend
    await fetch("https://backend-notification.vercel.app/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        eventName,
        eventTime: isoString,
        phoneNumber,
      }),
    });

    alert(`Event scheduled for ${name}`);
  };

  return (
    <>
    </>
  );
}
